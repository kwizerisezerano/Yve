interface AppEnv {
  apiBaseUrl: string;
}

function readApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL;
  if (!value) {
    throw new Error(
      "VITE_API_BASE_URL is not set. Add it to your .env file, see .env.example.",
    );
  }
  return value;
}

export const env: AppEnv = {
  apiBaseUrl: readApiBaseUrl(),
};
