import { Skeleton, Stack } from "@chakra-ui/react";

const loading = () => {
  return (
    <Stack gap={4} p={5}>
      <Skeleton height='24px' width='100%' />
      <Skeleton height='24px' width='100%' />
      <Skeleton height='24px' width='100%' />
      <Skeleton height='24px' width='100%' />
    </Stack>
  );
};

export default loading;
