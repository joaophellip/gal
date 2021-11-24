import 'should'

// eslint-disable-next-line mocha/no-skipped-tests
xdescribe('API entrypoint tests', function () {

    describe('invoke index.main', function () {
      it('should return a string "Hello World"', async function () {

        const index = await import('../src/index.js')
        const response = index.main()

        response.should.be.a.String()
        response.should.equal('Hello World')
      })
    })

})