import { Router } from 'express';
import * as c from '../controllers/transactions.controller.js';

const router = Router();
router.get('/calendar', c.calendar);
router.get('/day', c.day);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

export default router;
