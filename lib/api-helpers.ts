import { toast } from "sonner";

interface ApiSubmitOptions {
    loadingMessage: string;
    successMessage: string;
    errorMessage?: string;
}

/**
 * A reusable helper function to handle form submissions via FormData.
 * It manages loading states, and success/error notifications using sonner.
 * @param endpoint The API endpoint to submit the form to.
 * @param formData The FormData object to be sent.
 * @param options Configuration for toast messages.
 * @returns The parsed JSON response on success, or null on failure.
 */
export async function submitFormData<T>(
    endpoint: string,
    formData: FormData,
    options: ApiSubmitOptions
): Promise<T | null> {
    const toastId = toast.loading(options.loadingMessage);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
            toast.success(options.successMessage, { id: toastId });
            return result as T;
        } else {
            const errorMessage = result.message || options.errorMessage || "An unknown error occurred.";
            toast.error(errorMessage, { id: toastId });
            console.error("API Error:", result.errors || result.message);
            return null;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast.error(errorMessage, { id: toastId });
        console.error("Unexpected error:", error);
        return null;
    }
}