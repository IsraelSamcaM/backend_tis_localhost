import { Gestion } from '../models/Gestion.js';

export const getGestiones = async (req, res) => {
    try {
        const gestiones = await Gestion.findAll();
        res.json(gestiones);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getGestion = async (req, res) => {
    try {
        const { id_gestion } = req.params;
        const gestion = await Gestion.findOne({ where: { id_gestion } });
        if (!gestion) return res.status(404).json({ message: "La gestión no existe" });
        res.json(gestion);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createGestion = async (req, res) => {
    const { anio, semestre } = req.body;
    try {
        const newGestion = await Gestion.create({ anio, semestre });
        res.json(newGestion);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateGestion = async (req, res) => {
    try {
        const { id_gestion } = req.params;
        const { anio, semestre } = req.body;

        const gestion = await Gestion.findByPk(id_gestion);
        gestion.anio = anio;
        gestion.semestre = semestre;

        await gestion.save();

        res.json(gestion);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteGestion = async (req, res) => {
    try {
        const { id_gestion } = req.params;
        await Gestion.destroy({ where: { id_gestion } });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
