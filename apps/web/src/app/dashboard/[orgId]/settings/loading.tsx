import { Box, Skeleton, Stack } from "@chakra-ui/react";

const loading = () => {
  return (
    <Stack gap={6} maxW='xl'>
      {/* Header */}
      <Stack gap={1}>
        <Skeleton height='28px' width='220px' />
        <Skeleton height='16px' width='340px' />
      </Stack>

      {/* Rename Workspace Card */}
      <Box bg='bg.panel' p={6} borderRadius='lg' borderWidth='1px'>
        <Stack gap={4}>
          <Skeleton height='20px' width='160px' />
          <Stack gap={2}>
            <Skeleton height='14px' width='120px' />
            <Skeleton height='40px' width='100%' />
          </Stack>
          <Skeleton height='40px' width='120px' />
        </Stack>
      </Box>

      {/* Security Infrastructure Card */}
      <Box bg='bg.panel' p={6} borderRadius='lg' borderWidth='1px'>
        <Stack gap={3}>
          <Skeleton height='20px' width='180px' />
          <Skeleton height='14px' width='100%' />
          <Skeleton height='14px' width='80%' />
          <Skeleton height='36px' width='100%' borderRadius='md' />
        </Stack>
      </Box>
    </Stack>
  );
};

export default loading;
