import { pagination } from './utlities';
import { IApiQuery, IAPIQueryString } from './types/utilites';

export default class ApiFeatures<T> {
  constructor(public query: IApiQuery<T>, public queryString: IAPIQueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    const queryStringClone = { ...this.queryString };
    excludedFields.forEach((field) => delete queryStringClone[field]);

    let queryStr = JSON.stringify(queryStringClone);
    queryStr = queryStr.replace(/\b(gt|gte|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (!this.queryString.sort) {
      this.query = this.query.sort('-_id');
      return this;
    }
    if (!(typeof this.queryString.sort === 'string')) {
      this.query = this.query.sort('-_id');
      return this;
    }
    const sortedFields = this.queryString.sort.split(',').join(' ');
    this.query = this.query.sort(sortedFields);
    return this;
  }

  limitingFields() {
    if (!this.queryString.fields) {
      this.query = this.query.select('-__v');
      return this;
    }
    // queryString.fields  is exist but it's an array(paramater pollution)
    if (!(typeof this.queryString.fields === 'string')) {
      this.query = this.query.select('-__v');
      return this;
    }
    const limitedFields = this.queryString.fields.split(',').join(' ');
    this.query = this.query.select(limitedFields);
    return this;
  }

  pagination() {
    const page = +(this.queryString.page || pagination.page);
    const limit = +(this.queryString.limit || pagination.limit);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
