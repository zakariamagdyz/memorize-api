import ApiFeatures from '../ApiFeatures';

//eslint-disable-next-line
//@ts-ignore
const Query = {
  state: {
    filter: {},
    select: '',
    sort: '',
    skip: 0,
    limit: 0,
  },

  find(this: typeof Query, filter: object) {
    this.state.filter = filter;
    return this;
  },
  select(this: typeof Query, fields: string) {
    this.state.select = fields;
    return this;
  },
  sort(this: typeof Query, fields: string) {
    this.state.sort = fields;
    return this;
  },
  skip(this: typeof Query, docs: number) {
    this.state.skip = docs;
    return this;
  },
  limit(this: typeof Query, docs: number) {
    this.state.limit = docs;
    return this;
  },
};

describe('ApiFeatures', () => {
  afterEach(() => {
    Query.state = {
      filter: {},
      select: '',
      sort: '',
      skip: 0,
      limit: 0,
    };
  });

  describe('Filter', () => {
    it('should return the state with filter object', () => {
      // arrange

      const queryReq = { name: 'zakaria', description: 'hola' };
      // act
      new ApiFeatures(Query, queryReq).filter();
      // assert
      expect(Query.state.filter).toMatchObject(queryReq);
    });

    it('should support complex query $gt|$gte', () => {
      // arrange

      const queryReq = { price: { gte: 50 }, age: { gt: 25 } };
      // act
      new ApiFeatures(Query, queryReq).filter();
      // assert
      const newQueryReq = { price: { $gte: 50 }, age: { $gt: 25 } };
      expect(Query.state.filter).toMatchObject(newQueryReq);
    });

    it('should support complex query $lte|$lt', () => {
      // arrange

      const queryReq = { price: { lte: 50 }, age: { lt: 25 } };
      // act
      new ApiFeatures(Query, queryReq).filter();
      // assert
      const newQueryReq = { price: { $lte: 50 }, age: { $lt: 25 } };
      expect(Query.state.filter).toMatchObject(newQueryReq);
    });
  });

  describe('Sort', () => {
    it("should sort by decrement if sort query doesn't exist", () => {
      const queryReq = { price: 99 };
      new ApiFeatures(Query, queryReq).sorting();
      expect(Query.state.sort).toMatch('-createdAt');
    });

    it('should sort by single value if exist', () => {
      const queryReq = { sort: 'price' };
      new ApiFeatures(Query, queryReq).sorting();
      expect(Query.state.sort).toMatch('price');
    });

    it('should sort by multiple values ', () => {
      const queryReq = { sort: 'price,-age' };
      new ApiFeatures(Query, queryReq).sorting();
      expect(Query.state.sort).toMatch('price -age');
    });

    it('should ignore sort with type array ', () => {
      const queryReq = { sort: ['page', 'age'] } as unknown as { sort: string };
      new ApiFeatures(Query, queryReq).sorting();
      expect(Query.state.sort).toMatch('-createdAt');
    });
  });

  describe('LimitingFields', () => {
    it('should exclude __V if no select value exist', () => {
      const queryReq = { price: 99 };
      new ApiFeatures(Query, queryReq).limitingFields();
      expect(Query.state.select).toMatch('-__v');
    });

    it('should get only selected fields', () => {
      const queryReq = { fields: 'firstname,lastname,phone' };
      new ApiFeatures(Query, queryReq).limitingFields();
      expect(Query.state.select).toMatch('firstname lastname phone');
    });

    it('should ignore fields with type array ', () => {
      const queryReq = { fields: ['firstname', 'lastname'] } as unknown as {
        sort: string;
      };
      new ApiFeatures(Query, queryReq).limitingFields();
      expect(Query.state.select).toMatch('-__v');
    });
  });

  describe('Paginations', () => {
    it('should return first 20 Docs if no page or limit exist', () => {
      const queryReq = { name: 'zakaria' };
      new ApiFeatures(Query, queryReq).pagination();
      expect(Query.state.skip).toEqual(0);
      expect(Query.state.limit).toEqual(20);
    });

    it('should return page 2 and limit for field 3', () => {
      const queryReq = { page: '2', limit: '3' };
      new ApiFeatures(Query, queryReq).pagination();
      expect(Query.state.skip).toEqual(3);
      expect(Query.state.limit).toEqual(3);
    });
  });
});
