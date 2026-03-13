"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const Artwork_1 = __importDefault(require("../models/Artwork"));
const User_1 = __importDefault(require("../models/User"));
const search = async (req, res) => {
    const { q, type = 'all' } = req.query;
    if (!q || q.trim().length < 2) {
        res.status(400).json({ success: false, error: 'Query must be at least 2 characters' });
        return;
    }
    const results = {};
    if (type === 'all' || type === 'artworks') {
        results.artworks = await Artwork_1.default.find({ $text: { $search: q }, status: 'published' }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .limit(10)
            .populate('artist', 'name avatar slug');
    }
    if (type === 'all' || type === 'users') {
        results.users = await User_1.default.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .limit(10);
    }
    res.json({ success: true, data: results });
};
exports.search = search;
//# sourceMappingURL=searchController.js.map