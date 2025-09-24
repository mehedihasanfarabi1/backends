import React from "react";
import { useTranslation } from "../context/TranslationContext";

const TranslationUsageExample = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: 20 }}>
      <h3>{t("dashboard")}</h3>
      <p>{t("visitors")}</p>
      <p>{t("weekly orders")}</p>

      <hr />

      <p>
        You can call <code>t("dashboard")</code> or <code>t("Dashboard")</code> (we try to match by key or by English text).
      </p>
    </div>
  );
};

export default TranslationUsageExample;