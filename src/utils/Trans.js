import { useTranslation } from 'react-i18next'

export default ({value})=> {
  const { t } = useTranslation();

  return t(value);
}
