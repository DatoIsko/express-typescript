'use strict';

import {
    BAD_REQUEST_CODE, CREATED_CODE, SUCCESS_CODE,
    UNAUTHORIZED_CODE, VALIDATION_ERROR_CODE,
} from '../../app/configs/status-codes';
import {
    CREDENTIALS_NOT_MATCHING, FAIL_STATUS_MESSAGE,
    INVALID_AUTHORIZATION_HEADER, INVALID_BASE64,
    USER_NOT_EXIST, VALIDATION_ERROR
} from '../../app/configs/response-messages';
import database from '../../app/configs/database';
import params from '../../app/configs/params';
import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
import base64 from 'base-64';
// import moment from 'moment';
import chai from 'chai';
import chaiHttp from 'chai-http';
import Knex from 'knex';
// import {MUST_BE_UNIQUE} from '../../app/configs/validation-messages';
import { EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../app/configs/constants';
import { MUST_BE_UNIQUE } from '../../app/configs/validation-messages';

const expect = chai.expect,
    should = chai.should(),
    knex = Knex(database);

chai.use(chaiHttp);

describe('Auth Module', () => {

    describe('/auth/sign-in POST(Sign user in)', () => {

        before(done => {
            knex('users')
                .insert([
                    {
                        name: 'user',
                        email: 'user@test.com',
                        password: bcrypt.hashSync('user_pass', bcrypt.genSaltSync(8)),
                    }
                ])
                .then(() => done());
        });

        it('it should give validation error for missing header', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .send({ email: 'user@test.com', password: 'user_pass' })
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    res.body.message.should.be.equal(INVALID_AUTHORIZATION_HEADER);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    done();
                });
        });

        it('it should give validation error from missing password', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basic ${base64.encode('user@test.com:user_pass')}`)
                .send({ email: 'user@test.com' })
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    res.body.message.should.be.equal(CREDENTIALS_NOT_MATCHING);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    done();
                });
        });

        it('it should give validation error for invalid password', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basic ${base64.encode('user@test.com:user_pass')}`)
                .send({ email: 'user@test.com', password: '123' })
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    res.body.message.should.be.equal(CREDENTIALS_NOT_MATCHING);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    // res.body.errors.should.not.be.null;
                    // res.body.errors.password.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for missing email', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basic ${base64.encode('user@test.com:user_pass')}`)
                .send({ password: '123456' })
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    res.body.message.should.be.equal(CREDENTIALS_NOT_MATCHING);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    // res.body.errors.should.not.be.null;
                    // res.body.errors.email.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for invalid email', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basic ${base64.encode('user@test.com:user_pass')}`)
                .send({ email: 'user', password: '123456' })
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    res.body.message.should.be.equal(CREDENTIALS_NOT_MATCHING);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    // res.body.errors.should.not.be.null;
                    // res.body.errors.email.should.not.be.null;
                    done();
                });
        });

        it('it should give validation error for long email', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basic ${base64.encode('asdfasdfasdfasdfasdfasdfasdfasdf@qwerqwerqwerqwerqwerqw.erqwerqwer:user_pass')}`)
                .send({
                    email: 'asdfasdfasdfasdfasdfasdfasdfasdf@qwerqwerqwerqwerqwerqw.erqwerqwer',
                    password: 'user_pass'
                })
                .end((err, res) => {
                    res.should.have.status(BAD_REQUEST_CODE);
                    res.body.message.should.be.equal(USER_NOT_EXIST);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    // res.body.errors.should.not.be.null;
                    // res.body.errors.email.should.not.be.null;
                    done();
                });
        });

        it('it should give authentication error for Auth header without space', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basicasdfasdfasdfasdf`)
                .send({ email: 'user@test.com', password: 'user_pass' })
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    res.body.message.should.be.equal(INVALID_AUTHORIZATION_HEADER);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.errors).to.be.null;
                    expect(res.body.data).to.be.null;
                    done();
                });
        });

        it('it should give Invalid base64 encrypted string', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basic asdfasdasd:ffasdfasdf`)
                .send({ email: 'user@test.com', password: 'user_pass' })
                .end((err, res) => {
                    res.should.have.status(BAD_REQUEST_CODE);
                    res.body.message.should.be.equal(INVALID_BASE64);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    res.body.errors.message.should.be.equal('Invalid character: the string to be decoded is not correctly encoded.');
                    done();
                });
        });

        it('it should give authentication error for Auth header without \':\'', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basic asdfasdfasdfasdf`)
                .send({ email: 'user@test.com', password: 'user_pass' })
                .end((err, res) => {
                    res.should.have.status(UNAUTHORIZED_CODE);
                    res.body.message.should.be.equal(INVALID_AUTHORIZATION_HEADER);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.errors).to.be.null;
                    expect(res.body.data).to.be.null;
                    done();
                });
        });

        it('it should give authentication error for not matching credentials', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basic ${base64.encode('user1@test.com:user_pass1')}`)
                .send({ email: 'user1@test.com', password: 'user_pass1' })
                .end((err, res) => {
                    res.should.have.status(BAD_REQUEST_CODE);
                    res.body.message.should.be.equal(USER_NOT_EXIST);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    expect(res.body.errors).to.be.null;
                    done();
                });
        });

        it('it should sign in user', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-in')
                .set('origin', params.appUrl)
                .set('Authorization', `Basic ${base64.encode('user@test.com:user_pass')}`)
                .send({ email: 'user@test.com', password: 'user_pass' })
                .end((err, res) => {
                    res.should.have.status(SUCCESS_CODE);
                    res.body.should.not.be.null;
                    res.body['access_token'].should.not.be.null;
                    res.body['refresh_token'].should.not.be.null;
                    res.body.user.should.not.be.null;
                    res.body.user.email.should.be.equal('user@test.com');
                    done();
                });
        });

        after(done => {
            knex('users')
                .del()
                .where('email', 'user@test.com')
                .then(() => done());
        });
    });

    describe('/auth/sign-up POST(Sign user up)', () => {

        it('it should give validation error for missing name', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-up')
                .set('origin', params.appUrl)
                .send({
                    email: 'user@test.com',
                    password: 'user_pass'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    JSON.parse(res.body.errors).name.should.not.be.null;
                    JSON.parse(res.body.errors).name[0].message.should.be.equal('should have required property \'name\'');
                    done();
                });
        });

        // it('it should give validation error for invalid name', done => {
        //     chai.request(params.apiUrl)
        //         .post('/auth/sign-up')
        //         .set('origin', params.appUrl)
        //         .send({
        //             name: 'asdf $^//)))(((& asdf',
        //             email: 'user@test.com',
        //             password: 'user_pass'
        //         })
        //         .end((err, res) => {
        //             console.log(res.body);
        //             res.should.have.status(VALIDATION_ERROR_CODE);
        //             res.body.message.should.be.equal(VALIDATION_ERROR);
        //             res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
        //             expect(res.body.data).to.be.null;
        //             res.body.errors.should.not.be.null;
        //             res.body.errors.last_name.should.not.be.null;
        //             Object.keys(res.body.errors).length.should.be.equal(1);
        //             done();
        //         });
        // });

        it('it should give validation error for long name', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-up')
                .set('origin', params.appUrl)
                .send({
                    name: 'asdfzxcvqwerujmyhn1249 polfbtiomsnfgor',
                    email: 'user@test.com\'',
                    password: 'user_pass'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    JSON.parse(res.body.errors).name.should.not.be.null;
                    JSON.parse(res.body.errors).name[0].message.should.be.equal(`should NOT be longer than ${NAME_MAX_LENGTH} characters`);
                    done();
                });
        });

        it('it should give validation error for missing email', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-up')
                .set('origin', params.appUrl)
                .send({
                    name: 'user',
                    password: 'user_pass'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    JSON.parse(res.body.errors).email.should.not.be.null;
                    JSON.parse(res.body.errors).email[0].message.should.be.equal('should have required property \'email\'');
                    done();
                });
        });

        // it('it should give validation error for invalid email', done => {
        //     chai.request(params.apiUrl)
        //         .post('/auth/sign-up')
        //         .set('origin', params.appUrl)
        //         .send({
        //             name: 'user',
        //             email: 'asdf',
        //             password: 'user_pass'
        //         })
        //         .end((err, res) => {
        //             console.log(res.body);
        //             res.should.have.status(VALIDATION_ERROR_CODE);
        //             res.body.message.should.be.equal(VALIDATION_ERROR);
        //             res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
        //             expect(res.body.data).to.be.null;
        //             res.body.errors.should.not.be.null;
        //             res.body.errors.email.should.not.be.null;
        //             Object.keys(res.body.errors).length.should.be.equal(1);
        //             done();
        //         });
        // });

        it('it should give validation error for long email', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-up')
                .set('origin', params.appUrl)
                .send({
                    name: 'user',
                    email: 'asdfasdfasdfasdfasdfasdfasdfasdf@qwerqwerqwerqwerqwerqw.erqwerqwer',
                    password: '1nActive_pa8s'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    JSON.parse(res.body.errors).email.should.not.be.null;
                    JSON.parse(res.body.errors).email[0].message.should.be.equal(`should NOT be longer than ${EMAIL_MAX_LENGTH} characters`);
                    done();
                });
        });

        it('it should give validation error for missing password', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-up')
                .set('origin', params.appUrl)
                .send({
                    name: 'user',
                    email: 'user@test.com'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    JSON.parse(res.body.errors).password.should.not.be.null;
                    JSON.parse(res.body.errors).password[0].message.should.be.equal('should have required property \'password\'');
                    done();
                });
        });

        // it('it should give validation error for invalid password', done => {
        //     chai.request(params.apiUrl)
        //         .post('/auth/sign-up')
        //         .set('origin', params.appUrl)
        //         .send({
        //             name: 'user',
        //             email: 'test@email.com',
        //             password: 'passqwer'
        //         })
        //         .end((err, res) => {
        //             res.should.have.status(VALIDATION_ERROR_CODE);
        //             res.body.message.should.be.equal(VALIDATION_ERROR);
        //             res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
        //             expect(res.body.data).to.be.null;
        //             res.body.errors.should.not.be.null;
        //             res.body.errors.password.should.not.be.null;
        //             Object.keys(res.body.errors).length.should.be.equal(1);
        //             done();
        //         });
        // });

        it('it should give validation error for short password', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-up')
                .set('origin', params.appUrl)
                .send({
                    name: 'user',
                    email: 'test@email.com',
                    password: 'pass'
                })
                .end((err, res) => {
                    res.should.have.status(VALIDATION_ERROR_CODE);
                    res.body.message.should.be.equal(VALIDATION_ERROR);
                    res.body.status.should.be.equal(BAD_REQUEST_CODE);
                    expect(res.body.data).to.be.null;
                    res.body.errors.should.not.be.null;
                    JSON.parse(res.body.errors).password.should.not.be.null;
                    JSON.parse(res.body.errors).password[0].message.should.be.equal(`should NOT be shorter than ${PASSWORD_MIN_LENGTH} characters`);
                    done();
                });
        });
        //
        // it('it should give validation error for existing email', (done) => {
        //     knex('users')
        //         .insert([
        //             {
        //                 name: 'user',
        //                 email: 'user@test.com',
        //                 password: bcrypt.hashSync('user_pass', bcrypt.genSaltSync(8)),
        //             }
        //         ])
        //         .then((d) => {
        //             chai.request(params.apiUrl)
        //                 .post('/auth/sign-up')
        //                 .set('origin', params.appUrl)
        //                 .send({
        //                     name: 'user',
        //                     email: 'user@test.com',
        //                     password: 'user_pass'
        //                 })
        //                 .end((err, res) => {
        //                     console.log(';;', res.body);
        //                     res.should.have.status(VALIDATION_ERROR_CODE);
        //                     // res.body.message.should.be.equal(VALIDATION_ERROR);
        //                     // res.body.status.should.be.equal(BAD_REQUEST_CODE);
        //                     // JSON.parse(res.body.errors).should.not.be.null;
        //                     // res.body.data.should.be.null;
        //                     // JSON.parse(res.body.message).email.should.be.equal('Email must be unique.');
        //                     knex('users')
        //                         .del()
        //                         .where('email', 'user@test.com')
        //                         .then(() => d());
        //                 });
        //         });
        //
        // });

        it('it should sign up user', done => {
            chai.request(params.apiUrl)
                .post('/auth/sign-up')
                .set('origin', params.appUrl)
                .send({
                    name: 'user',
                    email: 'user@test.com',
                    password: 'user_pass'
                })
                .end((err, res) => {
                    res.should.have.status(CREATED_CODE);
                    res.body.should.not.be.null;
                    res.body.name.should.be.equal('user');
                    res.body.email.should.be.equal('user@test.com');
                    done();
                    // knex('users')
                    //     .del()
                    //     .where('email', 'user@test.com')
                    //     .then(() => done());
                });
        });
        after(done => {
            knex('users')
                .del()
                .where('email', 'user@test.com')
                .orWhere('email', 'asdf')
                .then(() => done());
        });
    });

    /* describe('/auth/sign-out POST(Sign user out)', () => {

     let token: string, expiredToken: string;

     before(done => {
     token = jwt.sign({id: 1}, params.tokenSecret, {expiresIn: 900});
     expiredToken = jwt.sign({id: 1}, params.tokenSecret, {expiresIn: 0});
     done();
     });

     it('it should give unauthorized', done => {
     chai.request(params.apiUrl)
     .post('/auth/sign-out')
     .set('origin', params.appUrl)
     .set('Cookie', cookies)
     .end((err, res) => {
     res.should.have.status(UNAUTHORIZED_CODE);
     done();
     });
     });

     it('it should give 401 with expired token', done => {
     chai.request(params.apiUrl)
     .post('/auth/sign-out')
     .set('origin', params.appUrl)
     .set('Cookie', cookies)
     .set('Authorization', `Bearer ${expiredToken}`)
     .end((err, res) => {
     res.should.have.status(UNAUTHORIZED_CODE);
     done();
     });
     });

     it('it should sign user out', done => {
     chai.request(params.apiUrl)
     .post('/auth/sign-out')
     .set('origin', params.appUrl)
     .set('Cookie', cookies)
     .set('Authorization', `Bearer ${token}`)
     .end((err, res) => {
     res.should.have.status(NO_CONTENT_CODE);
     done();
     });
     });
     });

     describe('/auth/refresh-token PUT(Update access token with refresh token)', () => {

     let refreshToken: string, refreshTokenWithoutID: string;

     before(done => {
     refreshToken = jwt.sign({id: 1}, params.refreshSecret);
     refreshTokenWithoutID = jwt.sign({name: 1}, params.refreshSecret);
     done();
     });

     it('it should give validation error for missing refresh token in cookies', done => {
     chai.request(params.apiUrl)
     .put('/auth/refresh-token')
     .set('origin', params.appUrl)
     .set('Cookie', cookies)
     .end((err, res) => {
     res.should.have.status(VALIDATION_ERROR_CODE);
     res.body.message.should.be.equal(VALIDATION_ERROR);
     res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
     expect(res.body.data).to.be.null;
     res.body.errors.should.not.be.null;
     res.body.errors.refreshToken.should.not.be.null;
     Object.keys(res.body.errors).length.should.be.equal(1);
     done();
     });
     });

     it('it should give invalid token error with error message', done => {
     chai.request(params.apiUrl)
     .put('/auth/refresh-token')
     .set('origin', params.appUrl)
     .set('Cookie', `${cookies};refreshToken=asdfasdfasdf;`)
     .end((err, res) => {
     res.should.have.status(BAD_REQUEST_CODE);
     res.body.message.should.be.equal(INVALID_REFRESH_TOKEN);
     res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
     expect(res.body.data).to.be.null;
     res.body.errors.message.should.be.equal('jwt malformed');
     done();
     });
     });

     it('it should give invalid token error without error message', done => {
     chai.request(params.apiUrl)
     .put('/auth/refresh-token')
     .set('origin', params.appUrl)
     .set('Cookie', `${cookies};refreshToken=${refreshTokenWithoutID};`)
     .end((err, res) => {
     res.should.have.status(BAD_REQUEST_CODE);
     res.body.message.should.be.equal(INVALID_REFRESH_TOKEN);
     res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
     expect(res.body.data).to.be.null;
     expect(res.body.errors).to.be.null;
     done();
     });
     });

     it('it should refresh access token', done => {
     chai.request(params.apiUrl)
     .put('/auth/refresh-token')
     .set('origin', params.appUrl)
     .set('Cookie', `${cookies};refreshToken=${refreshToken};`)
     .end((err, res) => {
     res.should.have.status(SUCCESS_CODE);
     res.body.message.should.be.equal(ACCESS_TOKEN_REFRESHED);
     res.body.status.should.be.equal(SUCCESS_STATUS_MESSAGE);
     expect(res.body.errors).to.be.null;
     res.body.data.accessToken.should.not.be.null;
     done();
     });
     });
     });

     describe('/auth/confirm-email PATCH(Activate user)', () => {

     let activationToken: string, expiredToken: string, userIDs: Array<number>;

     before(done => {
     activationToken = bcrypt.genSaltSync(8)
     .replace(new RegExp('/', 'g'), '_')
     .replace(/\./g, '_');
     expiredToken = bcrypt.genSaltSync(8)
     .replace(new RegExp('/', 'g'), '_')
     .replace(/\./g, '_');
     knex('users')
     .returning('id')
     .insert([
     {
     first_name: 'name',
     last_name: 'lastname',
     email: 'confirm1@user.com',
     avatar: 'avatars/temporary-profile-placeholder.jpg',
     password: bcrypt.hashSync('confirm1_pass', bcrypt.genSaltSync(8)),
     role: CREATOR_ROLE,
     active: INACTIVE
     },
     {
     first_name: 'name',
     last_name: 'lastname',
     email: 'confirm2@user.com',
     avatar: 'avatars/temporary-profile-placeholder.jpg',
     password: bcrypt.hashSync('confirm2_pass', bcrypt.genSaltSync(8)),
     role: CREATOR_ROLE,
     active: INACTIVE
     }
     ]).then((ids) => {
     userIDs = [ids[0], ids[0] + 1];
     knex('user_tokens').insert([
     {
     user_id: userIDs[0],
     token: activationToken,
     expiration: moment().add('1', 'days').format('YYYY-MM-DD HH:mm:ss'),
     reason: 'activation'
     },
     {
     user_id: userIDs[1],
     token: expiredToken,
     expiration: moment().add('-1', 'days').format('YYYY-MM-DD HH:mm:ss'),
     reason: 'activation'
     }
     ]).then(() => done());
     });
     });

     it('it should give 404 error for missing token', done => {
     chai.request(params.apiUrl)
     .patch('/auth/confirm-email')
     .set('origin', params.appUrl)
     .set('Cookie', cookies)
     .end((err, res) => {
     res.should.have.status(NOT_FOUND_CODE);
     expect(res.body.data).to.be.undefined;
     expect(res.body.errors).to.be.undefined;
     done();
     });
     });

     it('it should give 404 error for token in wrong place', done => {
     chai.request(params.apiUrl)
     .patch('/auth/confirm-email')
     .set('origin', params.appUrl)
     .set('Cookie', cookies)
     .end((err, res) => {
     res.should.have.status(NOT_FOUND_CODE);
     expect(res.body.data).to.be.undefined;
     expect(res.body.errors).to.be.undefined;
     done();
     });
     });

     it('it should give error invalid token', done => {
     chai.request(params.apiUrl)
     .patch('/auth/confirm-email/asdfasdfasdf')
     .set('origin', params.appUrl)
     .set('Cookie', cookies)
     .end((err, res) => {
     res.should.have.status(BAD_REQUEST_CODE);
     res.body.message.should.be.equal(IVALID_LINK_TOKEN);
     res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
     expect(res.body.data).to.be.null;
     expect(res.body.errors).to.be.null;
     done();
     });
     });

     it('it should give error invalid token for expiration', done => {
     chai.request(params.apiUrl)
     .patch(`/auth/confirm-email/${expiredToken}`)
     .set('origin', params.appUrl)
     .set('Cookie', cookies)
     .end((err, res) => {
     res.should.have.status(GONE_CODE);
     res.body.message.should.be.equal(EXPIRED_LINK_TOKEN);
     res.body.status.should.be.equal(FAIL_STATUS_MESSAGE);
     expect(res.body.data).to.be.null;
     expect(res.body.errors).to.be.null;
     done();
     });
     });

     it('it should activate user', done => {
     chai.request(params.apiUrl)
     .patch(`/auth/confirm-email/${activationToken}`)
     .set('origin', params.appUrl)
     .set('Cookie', cookies)
     .end((err, res) => {
     res.should.have.status(SUCCESS_CODE);
     res.body.message.should.be.equal(ACCOUNT_ACTIVATED);
     res.body.status.should.be.equal(SUCCESS_STATUS_MESSAGE);
     expect(res.body.errors).to.be.null;
     expect(res.body.data).to.be.null;
     done();
     });
     });

     after(done => {
     knex('user_tokens')
     .del()
     .then(() => {
     knex('users')
     .del()
     .whereIn('id', userIDs)
     .then(() => done());
     });
     });
     }); */
});
