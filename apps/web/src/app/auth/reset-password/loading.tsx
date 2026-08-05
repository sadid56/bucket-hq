import { Box, Flex, Skeleton, Stack } from "@chakra-ui/react";

const loading = () => {
  return (
    <Flex minH='100vh' align='center' justify='center' bg='bg.canvas'>
      <Box w='100%' maxW='md' p={8} bg='bg.panel' borderRadius='lg' borderWidth='1px' shadow='md'>
        <Stack gap={6}>
          {/* Title */}
          <Stack gap={2} align='center'>
            <Skeleton height='28px' width='200px' />
            <Skeleton height='14px' width='280px' />
          </Stack>

          {/* Email Field */}
          <Stack gap={2}>
            <Skeleton height='14px' width='100px' />
            <Skeleton height='40px' width='100%' />
          </Stack>

          {/* Submit Button */}
          <Skeleton height='44px' width='100%' borderRadius='md' />

          {/* Footer link */}
          <Skeleton height='14px' width='180px' mx='auto' />
        </Stack>
      </Box>
    </Flex>
  );
};

export default loading;
