declare module "web-push" {
  interface VapidDetails {
    subject: string
    publicKey: string
    privateKey: string
  }

  interface PushSubscription {
    endpoint: string
    keys?: {
      p256dh?: string
      auth?: string
    }
  }

  function setVapidDetails(subject: string, publicKey: string, privateKey: string): void
  function sendNotification(subscription: PushSubscription, payload?: string | Buffer, options?: any): Promise<any>

  const webpush: {
    setVapidDetails: typeof setVapidDetails
    sendNotification: typeof sendNotification
  }

  export default webpush
  export { setVapidDetails, sendNotification }
}





