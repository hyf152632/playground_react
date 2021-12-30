import { useCallback } from "react";
import { useTranslation } from "utils/i18n";

const I18n = () => {
  const { t, lng, changeLanguage } = useTranslation();

  const handleToggleLanguage = useCallback(() => {
    changeLanguage(lng === "en" ? "zh" : "en");
  }, [lng, changeLanguage]);

  return (
    <>
      <p>{t("hello, world")}</p>
      <p>{t("nest.greeting", { who: "huo" })}</p>
      <p>
        {t("a_cool_story", { where: "china", who: "Nobody", what: "life" })}
      </p>
      <hr />
      <button onClick={handleToggleLanguage}>Toggle Language ({lng})</button>
    </>
  );
};

export default I18n;
