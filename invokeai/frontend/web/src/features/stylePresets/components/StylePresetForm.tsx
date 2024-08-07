import { Button, Flex, FormControl, FormLabel, Icon, Input, Text } from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import { useStylePresetFields } from 'features/stylePresets/hooks/useStylePresetFields';
import { isModalOpenChanged, updatingStylePresetChanged } from 'features/stylePresets/store/stylePresetModalSlice';
import { toast } from 'features/toast/toast';
import { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { PiBracketsCurlyBold } from 'react-icons/pi';
import type { StylePresetRecordWithImage } from 'services/api/endpoints/stylePresets';
import { useCreateStylePresetMutation, useUpdateStylePresetMutation } from 'services/api/endpoints/stylePresets';

import { StylePresetPromptField } from './StylePresetPromptField';
import { StylePresetImageField } from './StylePresetImageField';

export type StylePresetFormData = {
  name: string;
  positivePrompt: string;
  negativePrompt: string;
  image: File | null;
};

export const StylePresetForm = ({ updatingPreset }: { updatingPreset: StylePresetRecordWithImage | null }) => {
  const [createStylePreset] = useCreateStylePresetMutation();
  const [updateStylePreset] = useUpdateStylePresetMutation();
  const dispatch = useAppDispatch();

  const stylePresetFieldDefaults = useStylePresetFields(updatingPreset);

  const { handleSubmit, control, formState, reset, register } = useForm<StylePresetFormData>({
    defaultValues: stylePresetFieldDefaults,
  });

  const handleClickSave = useCallback<SubmitHandler<StylePresetFormData>>(
    async (data) => {
      const payload = {
        name: data.name,
        positive_prompt: data.positivePrompt,
        negative_prompt: data.negativePrompt,
        image: data.image,
      };

      try {
        if (updatingPreset) {
          await updateStylePreset({
            id: updatingPreset.id,
            ...payload,
          }).unwrap();
        } else {
          await createStylePreset(payload).unwrap();
        }
      } catch (error) {
        toast({
          status: 'error',
          title: 'Failed to save style preset',
        });
      }

      dispatch(updatingStylePresetChanged(null));
      dispatch(isModalOpenChanged(false));
    },
    [dispatch, updatingPreset, updateStylePreset, createStylePreset]
  );

  return (
    <Flex flexDir="column" gap="4">
      <Flex alignItems="center" gap="4">
        <StylePresetImageField control={control} name="image" />
        <FormControl orientation="vertical">
          <FormLabel>Name</FormLabel>
          <Input size="md" {...register('name')} />
        </FormControl>
      </Flex>

      <StylePresetPromptField label="Positive Prompt" control={control} name="positivePrompt" />
      <StylePresetPromptField label="Negative Prompt" control={control} name="negativePrompt" />
      <Text variant="subtext">
        Use the <Icon as={PiBracketsCurlyBold} /> button to specify where your manual prompt should be included in the
        template. If you do not provide one, the template will be appended to your prompt.
      </Text>

      <Button onClick={handleSubmit(handleClickSave)}>Save</Button>
    </Flex>
  );
};
