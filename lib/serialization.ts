export function strictSerialize<T>(data: T): T {
  try {
    const json = JSON.stringify(data);
    const parsed = JSON.parse(json);
    
    // Verify the parsed data matches the original structure
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Serialization failed - result is not an object');
    }
    
    return parsed;
  } catch (error) {
    console.error('Serialization error:', {
      input: data,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new Error('Data serialization failed');
  }
}