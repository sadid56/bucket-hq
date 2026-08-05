import { Stack, Skeleton } from "@chakra-ui/react";

const loading = () => {
  return (
    <Stack gap={4} p={5} bg='bg.panel' borderRadius='lg' borderWidth='1px'>
      <Skeleton height='32px' width='100%' />
      <Skeleton height='32px' width='100%' />
      <Skeleton height='32px' width='100%' />
      <Skeleton height='32px' width='100%' />
    </Stack>
  );
};

export default loading;
