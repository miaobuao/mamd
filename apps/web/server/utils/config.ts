export const config = useRuntimeConfig()

export const isProduction = config.NODE_ENV === 'production'
