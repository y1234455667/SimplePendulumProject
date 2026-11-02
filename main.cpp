#include <iostream>
#include <fstream>
#include <vector>
#include <cmath>
#include <random>
#include <iomanip>
using namespace std;
const double pi = 3.14159265358979;
const double g = 9.80655;

double acceleration(double angle, double L) {
    return ((-g/ L) * sin(angle));
}

void stepforward (double& angle, double& ang_vel, double L, double dt) {
    double k1t = ang_vel;
    double k1w = acceleration(angle, L);

    double k2t = ang_vel + (dt/2) * k1w;
    double k2w = acceleration(angle  + (dt/2) * k1t, L);

    double k3t = ang_vel + (dt/2) * k2w;
    double k3w = acceleration(angle + (dt/2) * k2t, L);

    double k4t = ang_vel + dt * k3w;
    double k4w = acceleration(angle + dt * k3t, L);

    angle += (dt/6) * (k1t + 2*k2t + 2*k3t + k4t);
    ang_vel += (dt/6) * (k1w + 2*k2w + 2*k3w + k4w);
}

double findperiod(double orig_angle, double L, double dt) {
    double angle = orig_angle; //angle right now is the original angle at the time of release
    double t = 0.0;
    double ang_vel = 0.0;

    bool seen_first = false;
    double first_cross = 0.0;
    for (int i = 0; i < 20000; i++) {
        double prev_angle = angle;
        stepforward(angle, ang_vel, L, dt);
        t += dt;
        if (prev_angle < 0 && angle >= 0) {
            double fraction = (0 - prev_angle) / (angle - prev_angle);
            double cross_time = (t - dt) + fraction * dt; //meant to check for errors of small angle at 5 degrees. 
            if (!seen_first) {
                seen_first = true;
                first_cross = cross_time;
            }
            else {
                return cross_time - first_cross;
            }
        }

    }
    return -1.0; //IF we never cross the zero line. We would, but this is a safeguard to close the loop
}

double noisyreading(double real_t, int swings, double timing_error, mt19937& gen) {
    double cumulative_t = real_t * swings;
    normal_distribution<double> dist(0.0, timing_error);
    double err = dist(gen);
    return (cumulative_t + err)/swings; 
}

double mean(const vector<double>& v) {
    double sum = 0.0;
    for (double x : v) {
        sum += x;
    }
    return sum / v.size();
}

double stddev(const vector<double>& v) {
    double m = mean(v);
    double sum = 0.0;
    for (double x : v) {
        sum += (x - m) * (x - m);
    }
    return sqrt(sum / (v.size() -1));
}

void fitline(const vector<double>& x, const vector<double>& y, double& slope, double& intercept, double& slope_err) {
    int n = x.size();
    double xbar = mean(x); 
    double ybar = mean(y);
    double sxx = 0.0;
    double sxy = 0.0;
    for (int i = 0; i < n; i++) {
        sxx += (x[i] -xbar) * (x[i] - xbar);
        sxy += (x[i] - xbar) * (y[i] - ybar);
    }

    slope = sxy / sxx;
    intercept = ybar - slope * xbar;

    double ss = 0.0;
    for (int i = 0; i < n; i++) {
        double r = y[i] - (intercept + slope * x[i]);
        ss += r * r;
    }
    slope_err = sqrt(ss / (n-2) / sxx);
}

int main(int argc, char* argv[]) {
    double L = 1.0;                  
    double init_angle_deg = 5.0;     

    
    if (argc >= 3) {
        L = stod(argv[1]);
        init_angle_deg = stod(argv[2]);
    }

    const double dt = 0.01;
    const double total_time = 10.0;
    double angle = init_angle_deg * pi / 180.0;
    double ang_vel = 0.0;

    ofstream out2("angles.csv");
    out2 << fixed << setprecision(6);
    out2 << "time,theta,omega,x,y\n";

    double t = 0.0;
    while (t <= total_time) {
        double x = L * sin(angle);
        double y = L * cos(angle);

        out2 << t << "," << angle << "," << ang_vel << "," << x << "," << y << "\n";

        stepforward(angle, ang_vel, L, dt);
        t += dt;
    }
    out2.close();
    
    return 0;
}