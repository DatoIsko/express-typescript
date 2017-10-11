import { spy, stub, createStubInstance } from 'sinon';
import AuthController from '../../app/modules/auth/auth.controller';
import * as ErrorHandlers from '../../app/errors';
import chai from 'chai';
import { UserService } from '../../app/services/user.service';
import { User } from '../../models/user';
import { SUCCESS_CODE } from '../../app/configs/status-codes';

const sinonChai = require('sinon-chai');

const expect = chai.expect;

chai.should();
chai.use(sinonChai);

class MockResponse {
    statusCode;
    data;
    req;

    constructor(req) {
        this.req = req;
    }

    status(code) {
        this.statusCode = code;

        return this;
    }

    json(data) {
        this.data = data;

        return this;
    }
}

describe('Auth Controller', () => {
    describe('"checkEmail" method', () => {
        const BadRequest = stub(ErrorHandlers, 'BadRequest');
        const ValidationError = stub(ErrorHandlers, 'ValidationError');
        const ServiceUnavailable = stub(ErrorHandlers, 'ServiceUnavailable');
        const Error = stub(Error);
        let userStub = stub(UserService, 'getUserByEmail');

        let res = {};
        // let next = spy(function (data) {
        //     return data;
        // });

        let next = spy();

        it('should bring BadRequest error', done => {
            let req = {};

            AuthController.checkEmail(req, res, next);
            next.should.have.been.calledWith(new BadRequest);

            done();
        });

        it('should bring BadRequest ValidationError', done => {
            let req = { body: { email: 'user' } };
            let res = new MockResponse(req);

            const user = new User({
                email: 'user@test.com',
                name: 'user',
                password: '123'
            });
            userStub.throws(ValidationError)
            AuthController.checkEmail(req, res, next);
            next.should.have.been.calledWith(new ValidationError);

            done();
        });

        it('should bring ServiceUnavailable', done => {
            let req = { body: { email: 'user@test.com' } };
            let res = new MockResponse(req);

            Error.withArgs('Service');
            userStub.throws(Error);

            AuthController.checkEmail(req, res, next);
            next.should.have.been.calledWith(new ValidationError);

            done();
        });

        it('should return success response with {verified: false}', done => {
            let req = { body: { email: 'user@test.com' } };
            let res = new MockResponse(req);

            userStub.returns(null);

            AuthController.checkEmail(req, res, next)
                .then(() => {
                    expect(res.statusCode).to.equal(SUCCESS_CODE);
                    expect(res.data).to.have.property('verified', false);
                });

            done();
        });

        it('should return success response with {verified: true}', done => {
            let req = { body: { email: 'user@test.com' } };
            let res = new MockResponse(req);

            let user = new User({
                email: req.body.email,
                name: 'user',
                password: '123'
            });

            userStub.returns(user);

            AuthController.checkEmail(req, res, next)
                .then(() => {
                    expect(res.statusCode).to.equal(SUCCESS_CODE);
                    expect(res.data).to.have.property('verified', true);
                });

            done();
        });
    });
});
