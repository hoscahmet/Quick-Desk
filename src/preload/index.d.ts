import { QuickDeskAPI } from './index'

declare global {
  interface Window {
    api: QuickDeskAPI
  }
}
