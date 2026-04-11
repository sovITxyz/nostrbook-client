import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    getSettings,
    updateNotificationSettings,
    updateNotificationSettingsSchema,
    updateRelays,
    updateRelaysSchema,
    getMediaRead,
    updateMediaRead,
    updateMediaReadSchema,
    getPreferences,
    updatePreferences,
    updatePreferencesSchema,
    deleteAccount,
    deleteAccountSchema,
    cancelDeletion,
    exportData,
} from '../controllers/settings.controller';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/notifications', validate(updateNotificationSettingsSchema), updateNotificationSettings);
router.put('/relays', validate(updateRelaysSchema), updateRelays);
router.get('/media-read', getMediaRead);
router.put('/media-read', validate(updateMediaReadSchema), updateMediaRead);
router.get('/preferences', getPreferences);
router.put('/preferences', validate(updatePreferencesSchema), updatePreferences);
router.delete('/account', validate(deleteAccountSchema), deleteAccount);
router.put('/account/restore', cancelDeletion);
router.get('/account/export', exportData);

export default router;
