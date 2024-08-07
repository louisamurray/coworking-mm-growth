from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

@app.route('/calculate_growth', methods=['POST'])
def calculate_growth():
    data = request.get_json()
    membership_fee = data['membershipFee']
    total_seats = data['availableSeats'] + data['occupiedSeats']
    occupied_seats = data['occupiedSeats']
    turnover_rate = data['turnoverRate'] / 100
    growth_factor = data['growthFactor']

    final_occupied_seats = occupied_seats * growth_factor
    target_revenue = membership_fee * final_occupied_seats

    linear_growth_data = calculate_linear_growth(membership_fee, occupied_seats, target_revenue, total_seats, turnover_rate)
    constant_growth_data = calculate_constant_growth(membership_fee, occupied_seats, target_revenue, total_seats, turnover_rate)
    exponential_growth_data = calculate_exponential_growth(membership_fee, occupied_seats, target_revenue, total_seats, turnover_rate)

    summary = {
        'memberRevenue': target_revenue,
        'membershipFee': membership_fee,
        'availableSeats': total_seats - final_occupied_seats,
        'currentlyOccupiedSeats': final_occupied_seats,
        'turnoverSeatsPerMonth': turnover_rate * 100,
        'totalSeats': total_seats
    }

    return jsonify({
        'linearGrowth': linear_growth_data,
        'constantGrowth': constant_growth_data,
        'exponentialGrowth': exponential_growth_data,
        'summary': summary
    })

def calculate_linear_growth(membership_fee, initial_occupied_seats, target_revenue, total_seats, turnover_rate):
    month_data = []
    initial_revenue = initial_occupied_seats * membership_fee
    delta_r = (target_revenue - initial_revenue) / 12
    seats = initial_occupied_seats

    for month in range(1, 13):
        turnover_seats = math.ceil(seats * turnover_rate)
        new_members = math.ceil(delta_r / membership_fee)
        available_seats_beginning = total_seats - seats
        seats += new_members - turnover_seats
        available_seats_end = total_seats - seats
        revenue = initial_revenue + month * delta_r

        month_data.append({
            'month': month,
            'totalMembersBeginning': initial_occupied_seats if month == 1 else month_data[-1]['totalMembersEnd'],
            'totalMembersEnd': seats,
            'newMembers': new_members,
            'availableSeatsBeginning': available_seats_beginning,
            'availableSeatsEnd': available_seats_end,
            'mrrBeginning': round(initial_revenue + (month - 1) * delta_r),
            'netNewRevenue': round(delta_r),
            'mrrEnd': round(revenue),
            'growthRate': round((delta_r / (initial_revenue + (month - 1) * delta_r)) * 100, 2)
        })

    return month_data

def calculate_constant_growth(membership_fee, initial_occupied_seats, target_revenue, total_seats, turnover_rate):
    month_data = []
    initial_revenue = initial_occupied_seats * membership_fee
    growth_rate = (target_revenue / initial_revenue) ** (1 / 12)
    seats = initial_occupied_seats

    for month in range(1, 13):
        turnover_seats = math.ceil(seats * turnover_rate)
        revenue = initial_revenue * (growth_rate ** month)
        new_members = math.ceil((revenue - (initial_revenue * (growth_rate ** (month - 1)))) / membership_fee)
        available_seats_beginning = total_seats - seats
        seats += new_members - turnover_seats
        available_seats_end = total_seats - seats

        month_data.append({
            'month': month,
            'totalMembersBeginning': initial_occupied_seats if month == 1 else month_data[-1]['totalMembersEnd'],
            'totalMembersEnd': seats,
            'newMembers': new_members,
            'availableSeatsBeginning': available_seats_beginning,
            'availableSeatsEnd': available_seats_end,
            'mrrBeginning': round(initial_revenue * (growth_rate ** (month - 1))),
            'netNewRevenue': round(revenue - (initial_revenue * (growth_rate ** (month - 1)))),
            'mrrEnd': round(revenue),
            'growthRate': round((growth_rate - 1) * 100, 2)
        })

    return month_data

def calculate_exponential_growth(membership_fee, initial_occupied_seats, target_revenue, total_seats, turnover_rate):
    month_data = []
    initial_revenue = initial_occupied_seats * membership_fee
    growth_factor = (target_revenue / initial_revenue) ** (1 / 12)
    revenue = initial_revenue
    seats = initial_occupied_seats

    for month in range(1, 13):
        turnover_seats = math.ceil(seats * turnover_rate)
        delta_r = revenue * (growth_factor - 1)
        revenue += delta_r
        new_members = math.ceil(delta_r / membership_fee)
        available_seats_beginning = total_seats - seats
        seats += new_members - turnover_seats
        available_seats_end = total_seats - seats

        month_data.append({
            'month': month,
            'totalMembersBeginning': initial_occupied_seats if month == 1 else month_data[-1]['totalMembersEnd'],
            'totalMembersEnd': seats,
            'newMembers': new_members,
            'availableSeatsBeginning': available_seats_beginning,
            'availableSeatsEnd': available_seats_end,
            'mrrBeginning': round(revenue - delta_r),
            'netNewRevenue': round(delta_r),
            'mrrEnd': round(revenue),
            'growthRate': round((delta_r / (revenue - delta_r)) * 100, 2)
        })

    return month_data

if __name__ == '__main__':
    app.run(debug=True)