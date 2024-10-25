import { useSnackbar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

export const useCrudHelper = (resource) => {
  const message = useSnackbar();
  const { t } = useTranslation();

  const handleGetOne = async (getOne: () => any) => {
    const name = t(`${resource}:name_one`);
    try {
      const result = await getOne();
      return Promise.resolve(result);
    } catch (e) {
      const errorCode = e.response.status;
      if (errorCode === 401 || errorCode === 403) {
        message({
          message: t('crud:get_one.not_allowed', { resource: t('lockers:name_other') }),
          status: 'error',
        });
      } else {
        message({ message: capitalize(t('crud:get_one.error', { resource: name })), status: 'error' });
      }
    }
  };

  const handleGetMany = async (getMany: () => any): Promise<any[]> => {
    const name = t(`${resource}:name_other`);
    try {
      const result = await getMany();
      return Promise.resolve(result);
    } catch (e) {
      const errorCode = e.response.status;
      if (errorCode === 401 || errorCode === 403) {
        message({
          message: t('crud:get_many.not_allowed', { resource: t('lockers:name_other') }),
          status: 'error',
        });
      } else {
        message({ message: capitalize(t('crud:get_many.error', { resource: name })), status: 'error' });
      }
    }
  };

  const handleCreate = async (create: () => any) => {
    const name = t(`${resource}:name_one`);
    try {
      const result = await create();
      if (result) {
        message({ message: capitalize(t('crud:create.success', { resource: name })), status: 'success' });
        return Promise.resolve(result);
      }
    } catch (e) {
      const errorCode = e.response.status;
      if (errorCode === 401 || errorCode === 403) {
        message({
          message: t('crud:create.not_allowed', { resource: t('lockers:name_other') }),
          status: 'error',
        });
      } else {
        message({ message: t('crud:create.error', { resource: name }), status: 'error' });
      }
    }
  };

  const handleUpdate = async (update: () => any) => {
    const name = t(`${resource}:name_one`);
    try {
      const result = await update();
      if (result) {
        message({ message: capitalize(t('crud:update.success', { resource: name })), status: 'success' });
        return Promise.resolve(result);
      }
    } catch (e) {
      const errorCode = e.response.status;
      if (errorCode === 401 || errorCode === 403) {
        message({
          message: t('crud:update.not_allowed', { resource: t('lockers:name_other') }),
          status: 'error',
        });
      } else {
        message({ message: capitalize(t('crud:update.error', { resource: name })), status: 'error' });
      }
    }
  };

  const handleRemove = async (remove: () => any): Promise<any> => {
    const name = t(`${resource}:name_one`);
    try {
      const result = await remove();
      if (result) {
        message({ message: capitalize(t('crud:remove.success', { resource: name })), status: 'success' });
        return Promise.resolve(result);
      }
    } catch (e) {
      const errorCode = e.response.status;
      if (errorCode === 401 || errorCode === 403) {
        message({
          message: t('crud:remove.not_allowed', { resource: t('lockers:name_other') }),
          status: 'error',
        });
      } else {
        message({ message: capitalize(t('crud:remove.error', { resource: name })), status: 'error' });
      }
    }
  };

  return { handleGetOne, handleGetMany, handleCreate, handleUpdate, handleRemove };
};