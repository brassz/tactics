module.exports = {
  expo: {
    name: "NovixCred",
    slug: "sistema-financeiro-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/logo.png",
      resizeMode: "contain",
      backgroundColor: "#3B82F6"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sistemafinanceiro.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#3B82F6"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED"
      ],
      package: "com.sistemafinanceiro",
      versionCode: 1
    },
    web: {
      favicon: "./assets/images/logo.png",
      name: "NovixCred",
      shortName: "NovixCred",
      lang: "pt-BR",
      scope: "/",
      startUrl: "/",
      display: "standalone",
      orientation: "portrait",
      themeColor: "#3B82F6",
      backgroundColor: "#0F172A",
      bundler: "metro"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Permitir acesso à câmera para tirar selfie."
        }
      ],
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production"
        }
      ],
      "expo-notifications"
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "bacfdebe-09c8-48b7-929d-e42274fe8970"
      }
    },
    owner: "brassz"
  }
};

