const express = require('express');
const router = express.Router();
const pool = require('../db');
const { format } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');

router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
    SELECT 
      reservation.*,
      reservation.id AS id,
      TO_CHAR(reservation.solicitationDate, 'DD/MM/YYYY') AS solicitationDate,
      TO_CHAR(reservation.checkIn + INTERVAL '3 hours', 'DD/MM/YYYY - HH24:MI') AS checkin,
      TO_CHAR(reservation.checkOut + INTERVAL '3 hours', 'DD/MM/YYYY - HH24:MI') AS checkout,
      room.id AS roomId,
      room.name,
      room.maxguest,
      room.daily,
      reservationStatus.description as status 
    FROM reservation
    INNER JOIN room ON reservation.roomId = room.id
    INNER JOIN reservationStatus ON reservation.statusId = reservationStatus.id
    ORDER BY reservation.solicitationDate DESC`);
    const rows = result.rows;
    client.release();
    res.json(rows);

  } catch (err) {
    console.error('Erro ao executar a consulta', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
    SELECT *
    FROM reservationStatus
    ORDER BY description ASC`);
    const rows = result.rows;
    client.release();
    res.json(rows);

  } catch (err) {
    console.error('Erro ao executar a consulta', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/valid', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
    SELECT 
      reservation.*,
      TO_CHAR(reservation.solicitationDate, 'DD/MM/YYYY') AS solicitationDate,
      TO_CHAR(reservation.startDate, 'YYYY-MM-DD') AS startDate,
      TO_CHAR(reservation.endDate, 'YYYY-MM-DD') AS endDate,
      room.id AS roomId,
      room.name,
      room.maxguest,
      room.daily,
      reservationStatus.description as status 
    FROM reservation
    INNER JOIN room ON reservation.roomId = room.id
    INNER JOIN reservationStatus ON reservation.statusId = reservationStatus.id
    WHERE reservation.statusId IN (3, 5, 6, 7)
    ORDER BY reservation.solicitationDate DESC`);
    const rows = result.rows;
    client.release();
    res.json(rows);

  } catch (err) {
    console.error('Erro ao executar a consulta', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { clientId, employeeId, roomId, startDate, endDate, nameGuest, emailGuest, contactGuest, observation, adults, children, totalValue, statusId, internalReservation } = req.body;
    const client = await pool.connect();

    const result = await client.query(`
      INSERT INTO reservation 
      (clientId,
        employeeId,
        roomId, 
        startDate, 
        endDate, 
        nameGuest,
        emailGuest,
        contactGuest, 
        observation,
        adults,
        children,
        totalValue,
        statusId,
        internalReservation,
        solicitationDate)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_DATE)
      RETURNING *`,
      [clientId, employeeId, roomId, startDate, endDate, nameGuest, emailGuest, contactGuest, observation, adults, children, totalValue, statusId, internalReservation]);

    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/checkinout/:id', async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id)
    const { checkIn, checkOut, statusId } = req.body;
    const client = await pool.connect();
    const brazilTime = new Date();
    brazilTime.setTime(brazilTime.getTime() - (3 * 60 * 60 * 1000));

    let result;

    if (checkIn) {
      result = await client.query(`UPDATE reservation SET checkIn = $2, statusId = $3 WHERE id = $1`,
        [reservationId, brazilTime, statusId]);

    } else if (checkOut) {
      result = await client.query(`UPDATE reservation SET checkOut = $2, statusId = $3 WHERE id = $1`,
        [reservationId, brazilTime, statusId]);
    }

    client.release();
    res.status(201).json({ message: 'Reservation updated successfully' });
    
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/status/:id', async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id)
    const { statusId } = req.body;
    const client = await pool.connect();
    const result = await client.query(`UPDATE reservation SET statusId = $1 WHERE id = $2`,
      [statusId, reservationId]);

    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
