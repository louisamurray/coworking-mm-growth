from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/calculate_growth', methods=['POST'])
def calculate_growth():
    data = request.get_json()
    membership_fee = data['membershipFee']
    available_seats = data['availableSeats']
    occupied_seats = data['occupiedSeats']
    turnover_seats = data['turnoverSeats']
    growth_factor = data['growthFactor']

    current_revenue = membership_fee * occupied_seats
    target_revenue = current_revenue * growth_factor

    steady_growth_data = calculate_steady_growth(current_revenue, target_revenue, membership_fee, available_seats, occupied_seats, turnover_seats)
    exponential_growth_data = calculate_exponential_growth(current_revenue, target_revenue, membership_fee, available_seats, occupied_seats, turnover_seats)
    linear_growth_data = calculate_linear_growth(current_revenue, target_revenue, membership_fee, available_seats, occupied_seats, turnover_seats)

    return jsonify({
        'steadyGrowth': steady_growth_data,
        'exponentialGrowth': exponential_growth_data,
        'linearGrowth': linear_growth_data,
        'summary': generate_summary(steady_growth_data[-1], turnover_seats, growth_factor)
    })

def calculate_steady_growth(current_revenue, target_revenue, membership_fee, available_seats, occupied_seats, turnover_seats):
    month_data = []
    seats = occupied_seats
    revenue = current_revenue
    steady_new_members = (target_revenue - current_revenue) / 12 / membership_fee

    for i in range(12):
        available = available_seats - seats
        net_new_members = min(steady_new_members + turnover_seats, available)

        mrr_beginning = revenue
        net_new_revenue = net_new_members * membership_fee
        mrr_end = mrr_beginning + net_new_revenue
        growth_rate = ((mrr_end - mrr_beginning) / mrr_beginning * 100)

        month_data.append({
            'month': i + 1,
            'newMembers': steady_new_members,
            'availableSeats': available,
            'mrrBeginning': mrr_beginning,
            'netNewRevenue': net_new_revenue,
            'mrrEnd': mrr_end,
            'growthRate': growth_rate
        })

        seats += net_new_members - turnover_seats
        revenue = mrr_end

    return month_data

def calculate_exponential_growth(current_revenue, target_revenue, membership_fee, available_seats, occupied_seats, turnover_seats):
    month_data = []
    seats = occupied_seats
    revenue = current_revenue

    for i in range(12):
        growth_rate = pow(target_revenue / current_revenue, (i + 1) / 12)
        new_members = (current_revenue * growth_rate - revenue) / membership_fee
        available = available_seats - seats
        net_new_members = min(new_members + turnover_seats, available)

        mrr_beginning = revenue
        net_new_revenue = net_new_members * membership_fee
        mrr_end = mrr_beginning + net_new_revenue
        mrr_growth_rate = ((mrr_end - mrr_beginning) / mrr_beginning * 100)

        month_data.append({
            'month': i + 1,
            'newMembers': new_members,
            'availableSeats': available,
            'mrrBeginning': mrr_beginning,
            'netNewRevenue': net_new_revenue,
            'mrrEnd': mrr_end,
            'growthRate': mrr_growth_rate
        })

        seats += net_new_members - turnover_seats
        revenue = mrr_end

    return month_data

def calculate_linear_growth(current_revenue, target_revenue, membership_fee, available_seats, occupied_seats, turnover_seats):
    month_data = []
    seats = occupied_seats
    revenue = current_revenue
    total_growth = target_revenue - current_revenue
    monthly_increment = total_growth / 12

    for i in range(12):
        new_members = monthly_increment / membership_fee
        available = available_seats - seats
        net_new_members = min(new_members + turnover_seats, available)

        mrr_beginning = revenue
        net_new_revenue = net_new_members * membership_fee
        mrr_end = mrr_beginning + net_new_revenue
        growth_rate = ((mrr_end - mrr_beginning) / mrr_beginning * 100)

        month_data.append({
            'month': i + 1,
            'newMembers': new_members,
            'availableSeats': available,
            'mrrBeginning': mrr_beginning,
            'netNewRevenue': net_new_revenue,
            'mrrEnd': mrr_end,
            'growthRate': growth_rate
        })

        seats += net_new_members - turnover_seats
        revenue = mrr_end

    return month_data

def generate_summary(data, initial_turnover, growth_factor):
    final_turnover = initial_turnover * growth_factor
    total_turnover = initial_turnover + final_turnover * 12
    return {
        'memberRevenue': data['mrrEnd'],
        'membershipFee': data['mrrEnd'],
        'availableSeats': data['availableSeats'],
        'currentlyOccupiedSeats': data['newMembers'],
        'turnoverSeatsPerMonth': total_turnover
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)