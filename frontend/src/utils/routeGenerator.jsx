import React from "react";
import ProtectedRoute from "../contexts/ProtectedRoute";

/**
 * Generate CRUD routes with permission check
 * @param {String} basePath - base path of module
 * @param {Object} components - { List, Create, Edit }
 * @param {Object} permissions - { listPerm, createPerm, editPerm }
 */
export function generateCrudRoutes(basePath, components, permissions) {
  const { List, Create, Edit } = components;
  const { listPerm, createPerm, editPerm } = permissions;

  return [
    {
      path: `${basePath}`,
      element: <ProtectedRoute requiredPermissions={[listPerm]}>{<List />}</ProtectedRoute>
    },
    {
      path: `${basePath}/new`,
      element: <ProtectedRoute requiredPermissions={[createPerm]}>{<Create />}</ProtectedRoute>
    },
    {
      path: `${basePath}/:id`,
      element: <ProtectedRoute requiredPermissions={[editPerm]}>{<Edit />}</ProtectedRoute>
    },
  ];
}
