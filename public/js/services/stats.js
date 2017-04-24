import * as http from '../helpers/http';
import {
  STATS_STATISTICS,
  STATS_EXCEPTION,
} from '../constants/urls';

export function statistics(data) {
  return http.post(STATS_STATISTICS, data);
}

export function exception(data) {
  return http.post(STATS_EXCEPTION, data);
}
