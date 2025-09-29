import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { UserAPI, UserPermissionAPI } from "../api/permissions";

/**
 * ProtectedRoute
 * @param {ReactNode} children - route component
 * @param {Array} requiredPermissions - ["module_action"] যেমন: ["product_view","product_edit"]
 * @param {Number} companyId - company level access check (optional)
 */
function ProtectedRoute({ children, requiredPermissions = [], companyId = null }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem("token");
      const exp = localStorage.getItem("token_exp");

      if (!token || (exp && Date.now() >= exp * 1000)) {
        localStorage.clear();
        toast.error("🔒 Session expired, please login again");
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const user = await UserAPI.me();
        const userPerms = await UserPermissionAPI.getByUser(user.id);

        const userPermissionsArr = [];
        const allowedCompanyIds = new Set();

        userPerms.forEach((p) => {
          (p.companies || []).forEach((cid) => allowedCompanyIds.add(Number(cid)));

          const modules = [
            p.party_type_module,
            p.product_module,
            p.company_module,
            p.hr_module,
            p.loan_module,
            p.booking_module,
            p.pallot_module,
            p.sr_module,
            p.delivery_module,
            p.accounts_module,
            p.inventory_module,
            p.settings_module,
            p.ledger_module,
          ];

          modules.forEach((moduleObj) => {
            if (!moduleObj) return;
            Object.entries(moduleObj).forEach(([module, actions]) => {
              Object.entries(actions).forEach(([action, allowed]) => {
                if (allowed) userPermissionsArr.push(`${module}_${action}`);
              });
            });
          });
        });

        const hasRequiredPerms = requiredPermissions.every((p) =>
          userPermissionsArr.includes(p)
        );
        const hasCompanyAccess =
          companyId === null || allowedCompanyIds.has(Number(companyId));

        if (hasRequiredPerms && hasCompanyAccess) {
          setHasAccess(true);
        } else {
          throw new Error("Unauthorized");
        }
      } catch (err) {
        console.error("Permission check failed:", err);
        localStorage.clear();
        toast.error("🚫 You are not authorized to access this page");
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [requiredPermissions, companyId, location.pathname]);

  if (loading) return null;

  if (!hasAccess) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
