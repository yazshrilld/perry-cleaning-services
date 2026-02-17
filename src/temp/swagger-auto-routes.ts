
/**
 * @swagger
 * /api/perrycleans/health/check:
 *   get:
 *     summary: check
 *     tags: [health]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/health/encrypt:
 *   post:
 *     summary: encrytData
 *     tags: [health]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/health/decrypt:
 *   post:
 *     summary: decryptData
 *     tags: [health]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/sessions/check:
 *   get:
 *     summary: check
 *     tags: [sessions]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/sessions/add:
 *   post:
 *     summary: addSession
 *     tags: [sessions]
 *     
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             {
 *               "type": "object",
 *               "properties": {
 *                 "attachmentId": {
 *                   "type": "string"
 *                 },
 *                 "conversationId": {
 *                   "type": "string"
 *                 },
 *                 "businessId": {
 *                   "type": "string"
 *                 },
 *                 "messageId": {
 *                   "type": "string"
 *                 },
 *                 "fileName": {
 *                   "type": "string"
 *                 },
 *                 "fileType": {
 *                   "type": "string"
 *                 },
 *                 "fileSize": {
 *                   "type": "number",
 *                   "format": "float"
 *                 },
 *                 "mimeType": {
 *                   "type": "string"
 *                 },
 *                 "storageProvider": {
 *                   "type": "string",
 *                   "enum": [
 *                     "s3",
 *                     "cloudflare_r2"
 *                   ]
 *                 },
 *                 "storagePath": {
 *                   "type": "string"
 *                 },
 *                 "publicUrl": {
 *                   "type": "string",
 *                   "nullable": true
 *                 },
 *                 "uploadedBy": {
 *                   "type": "string"
 *                 },
 *                 "uploadedByType": {
 *                   "type": "string",
 *                   "enum": [
 *                     "customer",
 *                     "agent"
 *                   ]
 *                 },
 *                 "scanStatus": {
 *                   "type": "string",
 *                   "enum": [
 *                     "pending",
 *                     "clean",
 *                     "infected"
 *                   ]
 *                 }
 *               },
 *               "required": [
 *                 "conversationId",
 *                 "businessId"
 *               ],
 *               "additionalProperties": false
 *             }
 *         text/plain:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/sessions/{conversationId}:
 *   get:
 *     summary: getSessions
 *     tags: [sessions]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: conversationId
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/messages/check:
 *   get:
 *     summary: check
 *     tags: [messages]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/messages/save:
 *   post:
 *     summary: createMessage
 *     tags: [messages]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/messages/{conversationId}:
 *   get:
 *     summary: getMessages
 *     tags: [messages]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: conversationId
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/messages/{messageId}:
 *   patch:
 *     summary: updateMessageStatus
 *     tags: [messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: messageId
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/auth/check:
 *   get:
 *     summary: check
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/auth/login:
 *   post:
 *     summary: login
 *     tags: [auth]
 *     
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             {
 *               "type": "object",
 *               "properties": {
 *                 "emailOrUsername": {
 *                   "type": "string"
 *                 },
 *                 "password": {
 *                   "type": "string"
 *                 }
 *               },
 *               "required": [
 *                 "emailOrUsername",
 *                 "password"
 *               ],
 *               "additionalProperties": false
 *             }
 *         text/plain:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        

/**
 * @swagger
 * /api/perrycleans/auth/register:
 *   post:
 *     summary: register
 *     tags: [auth]
 *     
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             {
 *               "type": "object",
 *               "properties": {
 *                 "username": {
 *                   "type": "string"
 *                 },
 *                 "firstName": {
 *                   "type": "string"
 *                 },
 *                 "lastName": {
 *                   "type": "string"
 *                 },
 *                 "email": {
 *                   "type": "string",
 *                   "format": "email"
 *                 },
 *                 "phone": {
 *                   "type": "string"
 *                 },
 *                 "password": {
 *                   "type": "string",
 *                   "minLength": 6
 *                 },
 *                 "role": {
 *                   "type": "string"
 *                 }
 *               },
 *               "required": [
 *                 "username",
 *                 "firstName",
 *                 "lastName",
 *                 "email",
 *                 "phone",
 *                 "password"
 *               ],
 *               "additionalProperties": false
 *             }
 *         text/plain:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        