export const sequelize = {
  transaction: jest.fn((callback: () => Promise<any>) => {
    return callback()
  }),
}
