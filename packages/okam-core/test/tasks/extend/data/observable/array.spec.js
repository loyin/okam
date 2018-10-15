/**
 * @file Observable array test spec
 * @author sparklewhy@gmail.com
 */

'use strict';

/* eslint-disable babel/new-cap */

import assert from 'assert';
import expect, {createSpy} from 'expect';
import MyApp from 'core/App';
import MyComponent from 'core/Component';
import * as na from 'core/na/index';
import base from 'core/base/base';
import component from 'core/base/component';
import {clearBaseCache} from 'core/helper/factory';
import observable from 'core/extend/data/observable';

describe('observable array', function () {
    const rawEnv = na.env;
    const rawGetCurrApp = na.getCurrApp;
    const rawSelectComponent = component.selectComponent;
    beforeEach('init global App', function () {
        clearBaseCache();
        global.swan = {
            getSystemInfo() {},
            request() {},
            createSelectorQuery() {
                return {
                    select(path) {
                        return path;
                    }
                };
            }
        };

        component.selectComponent = function (path) {
            return 'c' + path;
        };

        na.getCurrApp = function () {
            return {};
        };
        na.env = base.$api = global.swan;

        global.Component = function (instance) {
            Object.assign(instance, instance.methods);
            return instance;
        };
    });

    afterEach('clear global App', function () {
        global.Component = undefined;
        global.swan = undefined;
        component.selectComponent = rawSelectComponent;
        na.getCurrApp = rawGetCurrApp;
        na.env = base.$api = rawEnv;
        expect.restoreSpies();
    });

    it('should not update array when update array using index', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: {a: 3, b: [23]},
                b: [23, {b: 56}]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        instance.a.b[0] = 5;
        instance.b[2] = 6;
        expect(instance.data).toEqual({
            a: {a: 3, b: [23]},
            b: [23, {b: 56}]
        });

        setTimeout(() => {
            expect(spySetData).toNotHaveBeenCalled();
            done();
        });
    });

    it('should update array item using setItem', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: {a: 3, b: [23]},
                b: [23, {b: 56}]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        instance.a.b.setItem(0, 5);
        instance.b.setItem(2, 6);
        expect(instance.data).toEqual({
            a: {a: 3, b: [5]},
            b: [23, {b: 56}, 6]
        });

        setTimeout(() => {
            expect(spySetData).toHaveBeenCalled();
            assert(spySetData.calls.length === 1);
            expect(spySetData.calls[0].arguments[0]).toEqual(
                {'a.b[0]': 5, 'b[2]': 6}
            );
            done();
        });
    });

    it('should return array item using getItem by index', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: {a: 3, b: [23]},
                b: [23, {b: 56}]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        assert(instance.a.b.getItem(0) === 23);
        assert(instance.a.b.getItem(1) === undefined);
        instance.b.getItem(1).b = 33;
        expect(instance.data.b).toEqual(
            [23, {b: 33}]
        );

        setTimeout(() => {
            expect(spySetData).toHaveBeenCalled();
            assert(spySetData.calls.length === 1);
            expect(spySetData.calls[0].arguments[0]).toEqual(
                {'b[1].b': 33}
            );
            done();
        });
    });

    it('should update array when call push array api', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: {a: 3, b: [23]},
                b: [23, {b: 56}]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        let len = instance.a.b.push(56);
        assert(len === 2);
        len = instance.a.b.push(7);
        assert(len === 3);

        instance.a.b.pop();
        len = instance.b.push(33, 56);
        assert(len === 4);

        expect(instance.data).toEqual({
            a: {a: 3, b: [23, 56]},
            b: [23, {b: 56}, 33, 56]
        });

        setTimeout(() => {
            expect(spySetData).toHaveBeenCalled();
            assert(spySetData.calls.length === 1);
            expect(spySetData.calls[0].arguments[0]).toEqual({
                'a.b[1]': 56,
                'a.b[2]': 7,
                'a.b': [23, 56],
                'b[2]': 33,
                'b[3]': 56
            });
            done();
        });
    });

    it('should pop array item when call pop api', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: {a: 3, b: [23]},
                b: [23, {b: 56}]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        let item = instance.a.b.pop();
        assert(item === 23);
        item = instance.a.b.pop();
        assert(item === undefined);
        instance.b.pop();

        expect(instance.data).toEqual({
            a: {a: 3, b: []},
            b: [23]
        });

        setTimeout(() => {
            expect(spySetData).toHaveBeenCalled();
            assert(spySetData.calls.length === 1);
            expect(spySetData.calls[0].arguments[0]).toEqual({
                'a.b': [], 'b': [23]
            });
            done();
        });
    });

    it('should reverse array', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: [12, 56]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        let result = instance.a.reverse();
        expect(result).toEqual([56, 12]);
        result = instance.a.reverse();
        expect(result).toEqual([12, 56]);

        expect(instance.data.a).toEqual([12, 56]);

        setTimeout(() => {
            expect(spySetData).toHaveBeenCalled();
            assert(spySetData.calls.length === 1);
            expect(spySetData.calls[0].arguments[0]).toEqual(
                {a: [12, 56]}
            );
            done();
        });
    });

    it('should sort array', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: [67, 12, 56]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        let result = instance.a.sort();
        expect(result).toEqual([12, 56, 67]);
        result = instance.a.sort();
        expect(result).toEqual([12, 56, 67]);

        expect(instance.data.a).toEqual([12, 56, 67]);
        expect(instance.a).toEqual([12, 56, 67]);

        setTimeout(() => {
            expect(spySetData).toHaveBeenCalled();
            assert(spySetData.calls.length === 1);
            expect(spySetData.calls[0].arguments[0]).toEqual(
                {a: [12, 56, 67]}
            );
            done();
        });
    });

    it('should splice array', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: [67, 12]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        let result = instance.a.splice(1, 1, 23, 5);
        expect(result).toEqual([12]);
        result = instance.a.splice(0, 1);
        expect(result).toEqual([67]);

        result = instance.a.splice(0, 0, 7);
        expect(result).toEqual([]);
        expect(instance.data.a).toEqual([7, 23, 5]);

        setTimeout(() => {
            expect(spySetData).toHaveBeenCalled();
            assert(spySetData.calls.length === 1);
            expect(spySetData.calls[0].arguments[0]).toEqual(
                {a: [7, 23, 5]}
            );
            done();
        });
    });

    it('should shift array', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: [67]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        let result = instance.a.shift();
        expect(result).toEqual(67);

        result = instance.a.shift();
        expect(result).toEqual(undefined);

        expect(instance.data.a).toEqual([]);

        setTimeout(() => {
            expect(spySetData).toHaveBeenCalled();
            assert(spySetData.calls.length === 1);
            expect(spySetData.calls[0].arguments[0]).toEqual(
                {a: []}
            );
            done();
        });
    });

    it('should unshift array', function (done) {
        MyApp.use(observable);
        let instance = MyComponent({
            data: {
                a: [67]
            }
        });

        let spySetData = createSpy(() => {});
        instance.setData = spySetData;

        instance.created();
        let result = instance.a.unshift(5);
        expect(result).toEqual(2);

        result = instance.a.unshift(2);
        expect(result).toEqual(3);

        expect(instance.data.a).toEqual([2, 5, 67]);

        setTimeout(() => {
            expect(spySetData).toHaveBeenCalled();
            assert(spySetData.calls.length === 1);
            expect(spySetData.calls[0].arguments[0]).toEqual(
                {a: [2, 5, 67]}
            );
            done();
        });
    });
});