export const natsWrapper = {
  client: {
    publish: jest.fn().mockImplementation(async () => {
      (subject:string, data:string, callback: () => void) => {
        callback();
        return;
      }
    })
  }
}