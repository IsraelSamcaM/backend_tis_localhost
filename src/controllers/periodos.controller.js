import { Periodo } from '../models/Periodo.js';

export const getPeriodos = async (req, res) => {
    try {
        const periodos = await Periodo.findAll();
        res.json(periodos);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getPeriodo = async (req, res) => {
    try {
        const { id_periodo } = req.params;
        const periodo = await Periodo.findOne({ where: { id_periodo } });
        if (!periodo) return res.status(404).json({ message: "El periodo no existe" });
        res.json(periodo);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createPeriodo = async (req, res) => {
    const { nombre_periodo, hora_inicio, hora_fin } = req.body;
    try {
        const newPeriodo = await Periodo.create({ nombre_periodo, hora_inicio, hora_fin });
        res.json(newPeriodo);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updatePeriodo = async (req, res) => {
    try {
        const { id_periodo } = req.params;
        const { nombre_periodo, hora_inicio, hora_fin } = req.body;

        const periodo = await Periodo.findByPk(id_periodo);
        periodo.nombre_periodo = nombre_periodo;
        periodo.hora_inicio = hora_inicio;
        periodo.hora_fin = hora_fin;

        await periodo.save();

        res.json(periodo);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deletePeriodo = async (req, res) => {
    try {
        const { id_periodo } = req.params;
        await Periodo.destroy({ where: { id_periodo } });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
