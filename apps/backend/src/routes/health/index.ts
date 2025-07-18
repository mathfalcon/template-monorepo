import { Router } from 'express'
import { HealthController } from '~/controllers/health'

const healthRouter: Router = Router()
const ctrl = new HealthController()

// Basic health check - just returns 200 OK
healthRouter.get('/', ctrl.basic.bind(ctrl))

// Detailed health check with all system information
healthRouter.get('/detailed', ctrl.detailed.bind(ctrl))

// Database health check only
healthRouter.get('/database', ctrl.database.bind(ctrl))

// Memory health check only
healthRouter.get('/memory', ctrl.memory.bind(ctrl))

// Kubernetes readiness probe
healthRouter.get('/ready', ctrl.readiness.bind(ctrl))

// Kubernetes liveness probe
healthRouter.get('/live', ctrl.liveness.bind(ctrl))

export default healthRouter 