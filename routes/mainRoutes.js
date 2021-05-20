import express from 'express'

import placesController from '../controllers/placesController'

const router = express.Router();

router.post('/addPlace', placesController.addPlaces);

export default router
