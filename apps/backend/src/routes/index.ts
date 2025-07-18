import { Router } from 'express'
import exampleRouter from './example'
import healthRouter from './health'

const apiRouter: Router = Router()

// Health check routes (no /api prefix)
apiRouter.use('/health', healthRouter)

// API routes
apiRouter.use('/example', exampleRouter)

export default apiRouter

export * from './example';
export * from './health';