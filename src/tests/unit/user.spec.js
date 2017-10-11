
/* 'use strict';
import {
    ACCOUNT_SUCCESSFULLY_UPDATED,
    COURSE_ASSIGNED,
    FAIL_STATUS_MESSAGE,
    NO_UPDATE_DETAILS,
    NOT_ALLOWED,
    NOT_FOUND,
    PAYMENT_CREATED,
    PERMISSION_DENIED,
    SOMETHING_WENT_WRONG,
    SUCCESS_STATUS_MESSAGE,
    SUCCESSFULLY_RETRIEVED,
    VALIDATION_ERROR
} from '../../app/configs/response-messages';
import {
    BAD_REQUEST_CODE,
    CREATED_CODE,
    FORBIDDEN_CODE,
    NOT_FOUND_CODE,
    SUCCESS_CODE,
    UNAUTHORIZED_CODE,
    VALIDATION_ERROR_CODE
} from '../../app/configs/status-codes';
import {ACTIVE, ORDER_STATUS_PENDING} from '../../app/configs/constants';
import database from '../../app/configs/database';
import params from '../app/configs/params';
import * as bcrypt from 'bcrypt-nodejs';
import * as jwt from 'jsonwebtoken';
import * as Knex from 'knex';
import * as chai from 'chai';

const expect = chai.expect,
    chaiHttp = require('chai-http'),
    should = chai.should(),
    knex = Knex(database);

chai.use(chaiHttp);

describe('User Module', () => {

    let cookies;

    before(done => {
        chai.request(params._apiUrl)
            .get('/auth/get-csrf')
            .set('origin', params._appUrl)
            .end((err, res) => {
                csrf = res.body.csrf;
                cookies = res.headers['set-cookie'];
                done();
            });
    });

    describe('/user/ PATCH(Update user details)', () => {

        let token, expiredToken, invalidToken, id, password;

        before(done => {
            password = 'active_pass';
            knex('users')
                .returning('id')
                .insert({
                    first_name: 'active',
                    last_name: 'user',
                    email: 'activeTesting@user.test.com',
                    password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)),
                    role: 'creator',
                    active: ACTIVE
                }).then(ids => {
                id = ids[0];
                token = jwt.sign({id: id}, params.tokenSecret, {expiresIn: 900});
                invalidToken = 'Asdfasdfasdf';
                expiredToken = jwt.sign({id: id}, params.tokenSecret, {expiresIn: 0});
                done();
            });
        });

        it('it should give csrf error for missing cookies', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    new_password: 'asdf5asdf',
                    password: 'active_pass'
                })
                .end((err, res) => {
                    res.should.have.status(FORBIDDEN_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal('invalid csrf token');
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    done();
                });
        });

        it('it should give csrf error for missing header', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    new_password: 'asdf5asdf',
                    password: 'active_pass'
                })
                .end((err, res) => {
                    res.should.have.status(FORBIDDEN_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal('invalid csrf token');
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    done();
                });
        });

        it('it should give unauthorized beacuse of missing header', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .send({email: 'new_active@user.com', password: 'active_pass'})
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    expect(res.body.status).to.be.undefined;
                    expect(res.body.message).to.be.undefined;
                    expect(res.body.data).to.be.undefined;
                    expect(res.body.errors).to.be.undefined;
                    done();
                });
        });

        it('it should give unauthorized for invalid token', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${invalidToken}`)
                .send({email: 'new_active@user.com', password: 'active_pass'})
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    expect(res.body.status).to.be.undefined;
                    expect(res.body.message).to.be.undefined;
                    expect(res.body.data).to.be.undefined;
                    expect(res.body.errors).to.be.undefined;
                    done();
                });
        });

        it('it should give unauthorized for expired token', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({email: 'new_active@user.com', password: 'active_pass'})
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    expect(res.body.status).to.be.undefined;
                    expect(res.body.message).to.be.undefined;
                    expect(res.body.data).to.be.undefined;
                    expect(res.body.errors).to.be.undefined;
                    done();
                });
        });

        it('it should give validation error for long first_name', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    first_name: 'asdf asdf asdf asdf asdf asdf asdf asdf ',
                    password: password
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.first_name.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for invalid first_name', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    first_name: 'asdf@$%{}sdfg',
                    password: password
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.first_name.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for long last_name', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    last_name: 'asdf asdf asdf asdf asdf asdf asdf asdf ',
                    password: password
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.last_name.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for invalid last_name', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    last_name: 'asdf@$%{}sdfg',
                    password: password
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.last_name.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for long email', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'asdfgasdfgfgasdfgasdfasdfgasdfg@asdffgasdfgasdfgasdfqweqrwqerg.com',
                    password: password
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.email.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for invalid email', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'asdf@$%{}sdfg',
                    password: password
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.email.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for existing email', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'creator@user.com',
                    password: password
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.email.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for missing password', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'test@test.com'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.password.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for short password', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'test@test.com',
                    password: 'Asdf'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.password.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for long password', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'test@test.com',
                    password: 'AsdffAsdffqwertqwertAsdffAsdffqwertqwertAsdffAsdffqwertqwertAsdffAsdffqwertqwert'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.password.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for short new password', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: password,
                    new_password: 'A8sdf'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.new_password.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for long new password', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: password,
                    new_password: 'AsdffAsdff8qwertqwertAsdffAsdffqwertqwertAsdffAsdffqwertqwertAsdffAsdffqwertqwert'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.new_password.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for invalid new password', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: password,
                    new_password: 'asdf'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.new_password.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for invalid new password', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: password,
                    new_password: 'as!@$$#^{}df'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    res.body.errors.new_password.should.not.be.null;
                    done();
                });
        });

        it('it should give bad request error for no update details', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({password: password})
                .end((err, res) => {
                    res.should.have.status(BAD_REQUEST_CODE);
                    res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
                    res.body.message.should.be.equal(NO_UPDATE_DETAILS);
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    done();
                });
        });

        it('it should update user', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({email: 'new_active@user.com', password: password})
                .end((err, res) => {
                    res.should.have.status(SUCCESS_CODE);
                    res.body.status.should.be.equal(SUCCESS_STATUS_MESSAGE);
                    res.body.message.should.be.equal(ACCOUNT_SUCCESSFULLY_UPDATED);
                    expect(res.body.errors).to.be.null;
                    res.body.data.should.not.be.null;
                    done();
                });
        });

        it('it should update user password', done => {
            chai.request(params._apiUrl)
                .patch('/user/')
                .set('origin', params._appUrl)
                .set('Cookie', cookies)
                .set('Authorization', `Bearer ${token}`)
                .send({new_password: 'new_p0sSw0rD', password: 'active_pass'})
                .end((err, res) => {
                    res.should.have.status(SUCCESS_CODE);
                    res.body.status.should.be.equal(SUCCESS_STATUS_MESSAGE);
                    res.body.message.should.be.equal(ACCOUNT_SUCCESSFULLY_UPDATED);
                    expect(res.body.errors).to.be.null;
                    res.body.data.should.not.be.null;
                    done();
                });
        });

        after(done => {
            knex('users')
                .del()
                .where('id', id)
                .then(() => done());
        });
    });

}); */
