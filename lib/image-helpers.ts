/**
 * Converts a File object into a Base64 data URL.
 * This is useful for creating persistent image previews that can be stored
 * in localStorage or sessionStorage.
 * @param file The image file to convert.
 * @returns A promise that resolves with the Base64 data URL.
 */
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

