export const sequelize = {
  transaction: async (callback: () => Promise<void>) => {
    await callback()
  },
}
