import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import schemas
import { ViewDocument } from './schemas/view.schema';
import { UserDocument } from 'api/users/schemas/user.schema';

// Import inputs
import { ViewInput } from './inputs/view.input';

@Injectable()
export class ViewsService {
    constructor(
        @InjectModel('View') private viewModel: Model<ViewDocument>,
        @InjectModel('User') private userModel: Model<UserDocument>,
    ) { }

    async createView(newView: ViewInput): Promise<ViewDocument> {
        try {
            delete newView._id;
            let presentView = {}
            if (newView.team)
                presentView = await this.viewModel.findOne({ name: newView.name, team: mongoose.Types.ObjectId(newView.team), type: newView.type })
            else
                presentView = await this.viewModel.findOne({ name: newView.name, team: undefined, user: mongoose.Types.ObjectId(newView.user), type: newView.type })

            if (presentView) {
                console.log("🚀 ~ file: views.service.ts ~ line 29 ~ ViewsService ~ createView ~ presentView", presentView)
                throw `VIEW.NAME_AND_TYPE_ALREADY_EXIST`
            }
            const view = new this.viewModel(newView);
            const v = await view.save();
            return v
        } catch (error) {
            throw error;
        }
    }

    async deleteViewById(id: string) {
        try {
            if (!id) throw 'USER.FAV_VIEW.ID_MISSING';
            const users = await this.userModel.find({
                $or: [
                    { 'activeViews.invoicesIn': `${id}` },
                    { 'activeViews.invoicesOut': `${id}` },
                    { 'activeViews.suppliers': `${id}` },
                    { 'activeViews.clients': `${id}` },
                    { 'activeViews.emails': `${id}` },
                    { favViews: id },
                ]
            })
            users.forEach(user => {
                let activeView = {}
                user.favViews = user.favViews.filter(v => v !== id);
                for (const [key, value] of Object.entries(user.activeViews)) {
                    if (value !== id) {
                        activeView[key] = value
                    }
                }
                user.activeViews = activeView
                user.save()
            })
            await this.viewModel.deleteOne({ _id: mongoose.Types.ObjectId(id) });
            return 'VIEW.DELETED';
        } catch (err) {
            throw err;
        }
    }

    async getViewsByTeam(teamId: string): Promise<ViewDocument[]> {
        try {
            const tid = mongoose.Types.ObjectId(teamId);
            const res = await this.viewModel
                .find({ team: tid }).sort({ type: 1 })
            return res
        } catch (error) {
            throw error;
        }

    }

    async getViewsByUser(userId: string): Promise<ViewDocument[]> {
        try {
            const uid = mongoose.Types.ObjectId(userId);
            const res = await this.viewModel
                .find({ $and: [{ user: uid }, { team: undefined }] }).sort({ type: 1 })
            return res

        } catch (error) {
            throw error;
        }
    }

    async updateView(view: ViewInput): Promise<ViewDocument> {
        try {
            const res = await this.viewModel.findOneAndUpdate(
                { _id: view._id },
                {
                    $set: {
                        columns: view.columns,
                        filters: view.filters,
                        sorts: view.sorts,
                        group: view.group,
                    },
                },
                { new: true },
            )
            return res
        } catch (error) {
            throw error;
        }
    }
}