import { Model, ValidationError } from 'objection';
import { hashSync, genSaltSync, compareSync } from 'bcryptjs';
import {
    EMAIL_MAX_LENGTH,
    NAME_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH } from '../app/configs/constants';

export class User extends Model {
    id;
    name;
    email;
    password;

    static tableName = 'users';

    static jsonSchema = {
        type: 'object',
        required: [
            'name',
            'email',
            'password'
        ],
        properties: {
            id: {
                type: 'integer'
            },
            name: {
                type: 'string',
                maxLength: NAME_MAX_LENGTH
            },
            email: {
                type: 'string',
                uniqueItems: true,
                maxLength: EMAIL_MAX_LENGTH
            },
            password: {
                type: 'string',
                minLength: PASSWORD_MIN_LENGTH,
                maxLength: PASSWORD_MAX_LENGTH
            },
            created_at: {
                type: 'date'
            },
            updated_at: {
                type: 'date'
            }
        }
    };

    static relationMappings = {
        tokens: {
            relation: Model.HasManyRelation,
            modelClass: `${__dirname}/token`,
            join: {
                from: 'users.id',
                to: 'user_tokens.user_id'
            }
        },
    };

    constructor() {
        super();
    }

    hashPassword() {
        this.password = hashSync(this.password, genSaltSync(8));
    }

    validatePassword(dbPass) {
        return compareSync(dbPass, this.password);
    }

    $beforeInsert() {
        this.hashPassword();

        return User.query().where('email', this.email).first()
            .then((dbUser) => {
                if (dbUser) {
                    throw new ValidationError({ email: 'Email must be unique.' });
                }
            });
    }

    $beforeUpdate(opt) {
        if (this.password && !compareSync(this.password, opt.old.password)) {
            this.hashPassword();
        }
        // console.log(opt.old.email);
        if (this.email && this.email !== opt.old.email) {
            return User.query().where('email', this.email).first().then(dbUser => {
                if (dbUser) {
                    throw new ValidationError({ email: 'Email must be unique.' });
                }
            });
        }

    }

    getFields() {
        return [
            'id',
            'name',
            'email',
            'active',
        ];
    }
}
