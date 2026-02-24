#include <bits/stdc++.h>
using namespace std;

int main()
{
    // Text (where we search)
    // string text = "aabaacabdcaabda";
    // string pattern = "aabda";
    string text;
    string pattern;
    cout<<"Enter text string:";
    cin>>text;
    cout<<"Enter pattern string:";
    cin>>pattern;


    // Pattern (what we search)

    int n = text.size();
    int m = pattern.size();

    // LPS array (Longest Proper Prefix which is also Suffix)
    // lps[i] = length of longest prefix == suffix for pattern[0...i]
    vector<int> lps(m);

    // -------------------------------
    // STEP 1: Build LPS array
    // -------------------------------

    lps[0] = 0;   // first element always 0
    int length = 0;  // length of previous longest prefix suffix
    int i = 1;

    while (i < m)
    {
        if (pattern[i] == pattern[length])
        {
            // extend previous prefix
            length++;
            lps[i] = length;
            i++;
        }
        else
        {
            if (length != 0)
            {
                // try shorter prefix
                length = lps[length - 1];
            }
            else
            {
                // no prefix match
                lps[i] = 0;
                i++;
            }
        }
    }

    // Print LPS array
    cout << "LPS array: ";
    for (int val : lps)
        cout << val << " ";
    cout << endl;


    // -------------------------------
    // STEP 2: Search pattern in text
    // -------------------------------

    vector<int> result; // stores starting indices of matches

    int textIndex = 0;     // pointer for text
    int patternIndex = 0;  // pointer for pattern

    while (textIndex < n)
    {
        // characters match
        if (text[textIndex] == pattern[patternIndex])
        {
            textIndex++;
            patternIndex++;
        }

        // full pattern matched
        if (patternIndex == m)
        {
            result.push_back(textIndex - patternIndex);

            // move patternIndex using LPS (optimization step)
            patternIndex = lps[patternIndex - 1];
        }

        // mismatch case
        else if (textIndex < n && text[textIndex] != pattern[patternIndex])
        {
            if (patternIndex != 0)
            {
                // move patternIndex using LPS
                patternIndex = lps[patternIndex - 1];
            }
            else
            {
                // move text pointer
                textIndex++;
            }
        }
    }

    // -------------------------------
    // Print result
    // -------------------------------

    cout << "Pattern found at indices: ";
    for (int val : result)
        cout << val << " ";
}