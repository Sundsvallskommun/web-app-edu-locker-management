import { SchoolLockerForm } from '@interfaces/locker.interface';
import { FormControl, FormLabel, Textarea } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const EditLockerComment = () => {
  const { register } = useFormContext<SchoolLockerForm>();

  const { t } = useTranslation();
  return (
    <FormControl className="w-full" size="md">
      <FormLabel>{t('common:comment')}</FormLabel>
      <Textarea {...register('comment')} className="w-full" data-test="edit-locker-comment" />
    </FormControl>
  );
};
