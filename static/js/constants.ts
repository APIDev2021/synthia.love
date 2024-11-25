export const env = {
  synthia: process.env.REACT_APP_SYNTHIA_ADDRESS,
};

const missingEnvVars = Object.values(env).some((val) => !val);

if (missingEnvVars) {
  console.error("MISSING ENV VARS");
}

console.log(env);
