import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable()
export class InvoiceService {

  save(payload: any): Observable<any> {

    if (payload.amount > 10000) {

      return of({

        success: false,

        message: 'Amount too large'

      }).pipe(delay(1000));

    }

    if (isNaN(payload.amount)) {

      return of({

        success: false,

        message: 'Amount is NaN'

      }).pipe(delay(1000));

    }

    return of({

      success: true,

      message: 'Invoice Saved'

    }).pipe(delay(1000));

  }

}