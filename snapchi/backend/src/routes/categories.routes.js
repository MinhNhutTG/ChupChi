import { Router } from 'express';
import * as c from '../controllers/categories.controller.js';

const router = Router();
router.get('/', c.list);
router.post('/', c.create);
router.delete('/:id', c.remove);

export default router;
