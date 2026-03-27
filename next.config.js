/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
            {
                protocol: "http",
                hostname: "phw.scoopsolutions.us",
            },
        ],
    },
    webpack: (config, { isServer }) => {
        // Fix "__dirname is not defined" in Edge Runtime (middleware)
        // A transitive dependency references __dirname which doesn't exist in Edge
        if (isServer) {
            config.plugins.push(
                new (require("webpack")).DefinePlugin({
                    __dirname: JSON.stringify("/"),
                    __filename: JSON.stringify("/"),
                })
            );
        }
        return config;
    },
};

module.exports = nextConfig;
