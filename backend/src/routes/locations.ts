import { Router } from 'express';
import { getLocations, getLocation } from '../controllers/locationController';

const router = Router();

router.get('/', getLocations);
router.get('/:id', getLocation);

export default router;