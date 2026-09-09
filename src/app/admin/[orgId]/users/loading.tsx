import { Box, Skeleton, Stack } from "@chakra-ui/react";

const loading = () => {
  return (
    <Stack gap={6}>
      {/* Header */}
      <Stack gap={1}>
        <Skeleton height='28px' width='200px' />
        <Skeleton height='16px' width='300px' />
      </Stack>

      {/* Users Table */}
      <Box bg='bg.panel' p={5} borderRadius='lg' borderWidth='1px'>
        <Stack gap={3}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height='48px' width='100%' borderRadius='md' />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export default loading;
