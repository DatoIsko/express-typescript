import {
    BAD_REQUEST_CODE,
    CREATED_CODE,
    SUCCESS_CODE,
    UNAUTHORIZED_CODE,
    VALIDATION_ERROR_CODE
} from "../../app/configs/status-codes";
import { hashSync, genSaltSync } from 'bcryptjs';
import database from "../../app/configs/database";
import params from "../../app/configs/params";
import chai from "chai";
import chaiHttp from "chai-http";
import Knex from "knex";
import {
    CREDENTIALS_NOT_MATCHING,
    EMAIL_MAX_LENGTH,
    INVALID_AUTHORIZATION_HEADER,
    INVALID_BASE64,
    INVALID_EMAIL,
    LENGTH_REQUIRED,
    NAME_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    REQUIRED,
    UNIQUE,
    USER_NOT_EXIST,
    VALIDATION_ERROR
} from '../../app/configs/messages';

const expect = chai.expect,
    should = chai.should(),
    knex = Knex(database);

chai.use(chaiHttp);

describe('Auth Module', () => {

    describe('/auth/check-email POST(Check email for existing)', () => {

        it('it should give validation error for missing email', done => {
            chai.request(params.apiUrl)
                .post('/auth/check-email')
                .set('origin', params.appUrl)
                .send()
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.email.should.not.be.null;
                    res.body.errors.email.msg.should.be.equal(REQUIRED('Email'));
                    done();
                });
        });

        it('it should give validation error for long email', done => {
            chai.request(params.apiUrl)
                .post('/auth/check-email')
                .set('origin', params.appUrl)
                .send({
                    email: 'asdfasdfasdfasdfasdfasdfasdfasdf@qwerqwerqwerqwerqwerqw.erqwerqwer'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.email.should.not.be.null;
                    res.body.errors.email.msg.should.be.equal(LENGTH_REQUIRED('Email', {max: EMAIL_MAX_LENGTH}));
                    done();
                });
        });

        it('it should give validation error for invalid email', done => {
            chai.request(params.apiUrl)
                .post('/auth/check-email')
                .set('origin', params.appUrl)
                .send({
                    email: 'user',
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.not.be.null;
                    res.body.errors.email.msg.should.be.equal(INVALID_EMAIL);
                    done();
                });
        });

        it('it should give boolean for existing email', (done) => {
            knex('users')
                .insert([
                    {
                        name: 'user',
                        email: 'user@test.com',
                        password: hashSync('user_pass_123', genSaltSync(8)),
                    }
                ])
                .then(() => {
                    chai.request(params.apiUrl)
                        .post('/auth/check-email')
                        .set('origin', params.appUrl)
                        .send({
                            email: 'user@test.com',
                        })
                        .end((err, res) => {
                            res.should.have.status(SUCCESS_CODE);
                            res.body.verified.should.be.equal(true);
                            knex('users')
                                .del()
                                .where('email', 'user@test.com')
                                .then(() => done());
                        });
                });

        });
    })
});
