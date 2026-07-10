import * as ImageManipulator from 'expo-image-manipulator';

/** Re-encode image to JPEG without preserving EXIF metadata (incl. GPS). */
export async function stripImageExif(sourceUri: string, compress = 0.8): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [],
    { compress, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}
